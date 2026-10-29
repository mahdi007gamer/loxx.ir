import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get, Post, Patch, Delete, Body, Req, Res, Param, Query, BadRequestException, ConflictException, UnauthorizedException, NotFoundException, HttpCode } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { json } from 'express';
import { clearSession, hashPassword, requireTrustedOrigin, requireUser, session, setSession, verifyPassword } from './security';
import { runtimeIssues } from './runtime-config';

const db = new PrismaClient();
const trim = (n: number) => z.string().trim().min(1).max(n);
const phoneSchema = trim(32).transform(value => value.replace(/[۰-۹٠-٩]/g, char => String('۰۱۲۳۴۵۶۷۸۹'.includes(char) ? '۰۱۲۳۴۵۶۷۸۹'.indexOf(char) : '٠١٢٣٤٥٦٧٨٩'.indexOf(char))))
  .refine(value => /^\+?[0-9\s()-]{7,32}$/.test(value) && value.replace(/\D/g, '').length >= 7);
const leadSchema = z.object({
  name: trim(90), phone: phoneSchema, email: z.string().email().max(200).optional().or(z.literal('')),
  service: trim(100), message: trim(2500)
});
const quoteSchema = z.object({
  name: trim(90), phone: phoneSchema, email: z.string().email().max(200).optional().or(z.literal('')),
  service: trim(100), features: z.array(trim(100)).max(24), budget: z.string().max(90).optional(),
  brief: z.string().trim().max(2500).default('')
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(200) });
const registerSchema = loginSchema.extend({ name: trim(90) });
const articleSchema = z.object({
  slug: z.string().min(3).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: trim(160), excerpt: trim(400), body: trim(80000), published: z.boolean(),
  category: trim(100).default('راهنمای پروژه'),
  coverImage: z.string().max(500).refine(value => /^\/images\/[a-zA-Z0-9_./-]+$/.test(value) || /^https:\/\/[^\s]+$/.test(value)).default('/images/devices.webp'),
  metaTitle: z.string().trim().max(160).default(''),
  metaDescription: z.string().trim().max(350).default(''),
  keywords: z.string().trim().max(1000).default('')
});
const statusSchema = z.object({ status: z.enum(['new', 'contacted', 'in_progress', 'closed']) });
const listSchema = z.object({
  q: z.string().trim().max(150).optional(),
  status: z.enum(['new', 'contacted', 'in_progress', 'closed']).optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  paginated: z.literal('1').optional()
});
const validate = <T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> => {
  const result = schema.safeParse(input);
  if (!result.success) throw new BadRequestException('مقادیر فرم معتبر نیستند.');
  return result.data;
};
const ipAttempts = new Map<string, { count: number; until: number }>();
function limitLogin(req: Request) {
  const ip = req.ip || 'unknown';
  const now = Date.now(), state = ipAttempts.get(ip);
  if (state && state.until > now && state.count >= 12) throw new BadRequestException('درخواست‌های متعدد؛ کمی بعد تلاش کنید.');
  ipAttempts.set(ip, state && state.until > now ? { ...state, count: state.count + 1 } : { count: 1, until: now + 900000 });
}
@Controller()
class ApiController {
  @Get('health') health() { return { ok: true, project: 'loxx', date: new Date().toISOString() }; }

  @Post('auth/register')
  async register(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() body: unknown) {
    requireTrustedOrigin(req); limitLogin(req);
    const data = validate(registerSchema, body);
    const email = data.email.toLowerCase();
    if (await db.user.findUnique({ where: { email } })) throw new ConflictException('این ایمیل قبلاً ثبت شده است.');
    const user = await db.user.create({ data: { name: data.name, email, passwordHash: hashPassword(data.password) } });
    setSession(res, user.id, user.role);
    return { id: user.id, role: user.role, name: user.name, email: user.email };
  }
  @Post('auth/login')
  @HttpCode(200)
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() body: unknown) {
    requireTrustedOrigin(req); limitLogin(req);
    const data = validate(loginSchema, body);
    const user = await db.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user || !verifyPassword(data.password, user.passwordHash)) throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است.');
    setSession(res, user.id, user.role);
    return { id: user.id, role: user.role, name: user.name, email: user.email };
  }
  @Post('auth/logout')
  @HttpCode(200)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    requireTrustedOrigin(req); clearSession(res); return { ok: true };
  }
  @Get('auth/me')
  async me(@Req() req: Request) {
    const s = requireUser(req);
    const user = await db.user.findUnique({ where: { id: s.id }, select: { id: true, name: true, email: true, role: true } });
    if (!user) throw new UnauthorizedException();
    return user;
  }
  @Post('leads')
  async lead(@Req() req: Request, @Body() body: unknown) {
    requireTrustedOrigin(req);
    const data = validate(leadSchema, body);
    const s = session(req);
    const lead = await db.lead.create({ data: { ...data, email: data.email || null, userId: s?.id } });
    return { id: lead.id, status: lead.status, message: 'درخواست شما ثبت شد.' };
  }
  @Post('quotes')
  async quote(@Req() req: Request, @Body() body: unknown) {
    requireTrustedOrigin(req);
    const data = validate(quoteSchema, body);
    const s = session(req);
    const quote = await db.quote.create({ data: { name: data.name, phone: data.phone, email: data.email || null, service: data.service, features: JSON.stringify(data.features), brief: data.brief, budget: data.budget || null, userId: s?.id } });
    return { id: quote.id, status: quote.status, message: 'درخواست پیش‌فاکتور ثبت شد.' };
  }
  @Get('my/requests')
  async mine(@Req() req: Request) {
    const s = requireUser(req);
    const [leads, quotes] = await Promise.all([
      db.lead.findMany({ where: { userId: s.id }, orderBy: { createdAt: 'desc' } }),
      db.quote.findMany({ where: { userId: s.id }, orderBy: { createdAt: 'desc' } })
    ]);
    return { leads, quotes };
  }
  @Get('articles')
  async articles() { return db.article.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, select: { id: true, slug: true, title: true, excerpt: true, category: true, coverImage: true, metaTitle: true, metaDescription: true, keywords: true, published: true, createdAt: true, updatedAt: true } }); }
  @Get('articles/:slug')
  async article(@Param('slug') slug: string) {
    const found = await db.article.findUnique({ where: { slug } });
    if (!found || !found.published) throw new NotFoundException();
    return found;
  }
  @Get('admin/overview')
  async overview(@Req() req: Request) {
    requireUser(req, true);
    const [leads, quotes, users, articles, newLeads, newQuotes, publishedArticles] = await Promise.all([db.lead.count(), db.quote.count(), db.user.count(), db.article.count(), db.lead.count({ where: { status: 'new' } }), db.quote.count({ where: { status: 'new' } }), db.article.count({ where: { published: true } })]);
    return { leads, quotes, users, articles, newLeads, newQuotes, publishedArticles, drafts: articles - publishedArticles };
  }
  @Get('admin/leads')
  async allLeads(@Req() req: Request, @Query() query: unknown) {
    requireUser(req, true);
    const filter = validate(listSchema, query);
    const where = { ...(filter.status ? { status: filter.status } : {}), ...(filter.q ? { OR: [{ name: { contains: filter.q } }, { phone: { contains: filter.q } }, { service: { contains: filter.q } }, { message: { contains: filter.q } }] } : {}) };
    const items = await db.lead.findMany({ where, orderBy: { createdAt: 'desc' }, skip: filter.paginated ? (filter.page - 1) * filter.pageSize : 0, take: filter.paginated ? filter.pageSize : 200 });
    return filter.paginated ? { items, total: await db.lead.count({ where }), page: filter.page, pageSize: filter.pageSize } : items;
  }
  @Get('admin/quotes')
  async allQuotes(@Req() req: Request, @Query() query: unknown) {
    requireUser(req, true);
    const filter = validate(listSchema, query);
    const where = { ...(filter.status ? { status: filter.status } : {}), ...(filter.q ? { OR: [{ name: { contains: filter.q } }, { phone: { contains: filter.q } }, { service: { contains: filter.q } }] } : {}) };
    const items = await db.quote.findMany({ where, orderBy: { createdAt: 'desc' }, skip: filter.paginated ? (filter.page - 1) * filter.pageSize : 0, take: filter.paginated ? filter.pageSize : 200 });
    return filter.paginated ? { items, total: await db.quote.count({ where }), page: filter.page, pageSize: filter.pageSize } : items;
  }
  @Get('admin/users')
  async allUsers(@Req() req: Request) {
    requireUser(req, true);
    return db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 200, select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { leads: true, quotes: true } } } });
  }
  @Patch('admin/leads/:id')
  async changeLead(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
    requireUser(req, true); requireTrustedOrigin(req);
    const { status } = validate(statusSchema, body);
    const exists = await db.lead.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException();
    return db.lead.update({ where: { id }, data: { status } });
  }
  @Patch('admin/quotes/:id')
  async changeQuote(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
    requireUser(req, true); requireTrustedOrigin(req);
    const { status } = validate(statusSchema, body);
    if (!await db.quote.findUnique({ where: { id } })) throw new NotFoundException();
    return db.quote.update({ where: { id }, data: { status } });
  }
  @Get('admin/articles')
  async allArticles(@Req() req: Request) { requireUser(req, true); return db.article.findMany({ orderBy: { updatedAt: 'desc' } }); }
  @Post('admin/articles')
  async saveArticle(@Req() req: Request, @Body() body: unknown) {
    requireUser(req, true); requireTrustedOrigin(req);
    const data = validate(articleSchema, body);
    if (await db.article.findUnique({ where: { slug: data.slug } })) throw new ConflictException('این نشانی مقاله قبلاً استفاده شده است. مقاله موجود را ویرایش کنید.');
    return db.article.create({ data });
  }
  @Patch('admin/articles/:id')
  async updateArticle(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
    requireUser(req, true); requireTrustedOrigin(req);
    const data = validate(articleSchema, body);
    if (!await db.article.findUnique({ where: { id } })) throw new NotFoundException();
    const slugOwner = await db.article.findUnique({ where: { slug: data.slug } });
    if (slugOwner && slugOwner.id !== id) throw new ConflictException('این نشانی مقاله قبلاً استفاده شده است.');
    return db.article.update({ where: { id }, data });
  }
  @Delete('admin/articles/:id')
  async deleteArticle(@Req() req: Request, @Param('id') id: string) {
    requireUser(req, true); requireTrustedOrigin(req);
    const found = await db.article.findUnique({ where: { id } });
    if (!found) throw new NotFoundException();
    await db.article.delete({ where: { id } }); return { ok: true };
  }
}
@Module({ controllers: [ApiController] })
class AppModule {}
async function bootstrap() {
  const issues = runtimeIssues(process.env);
  if (issues.length) throw new Error(issues.join('\n'));
  const app = await NestFactory.create(AppModule, { cors: false, bodyParser: false });
  app.use(json({ limit: '512kb' }));
  app.enableCors({
    origin: (process.env.WEB_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim()),
    credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
  });
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT || 4100), '0.0.0.0');
  console.log('LOXX API running on http://localhost:' + (process.env.PORT || '4100') + '/api/health');
}
bootstrap().catch(e => { console.error(e); process.exit(1); });
