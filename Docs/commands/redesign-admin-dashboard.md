# Prompt: Kompletní redesign Admin Dashboardu pro EduAI-Asistent

## 🎯 Cíl úkolu

Transformovat současný admin dashboard v EduAI-Asistent na **TOP-LEVEL administrační centrum**, které bude:
- **Intuitivní a jednoduché** pro správu celé aplikace
- **Rozdělené do logických sekcí** s jasnou navigací
- **Bohaté na funkce** pro kompletní správu platformy
- **Responsive a moderní** s profesionálním designem
- **Efektivní** pro rychlé rozhodování a akce

## 🔍 Analýza současného stavu

### ✅ Co už je implementováno:
- **DeveloperAdminPage**: Základní admin dashboard s KPI metrikami
- **SchoolAdminPage**: Správa školy a učitelů
- **Backend API**: Admin endpointy pro uživatele, školy, systém
- **Základní funkce**: User management, credit management, system health
- **Feature flags**: Systém pro zapínání/vypínání funkcí

### ❌ Co potřebuje vylepšení:
- **Organizace**: Dashboard je chaotický, chybí jasná struktura sekcí
- **Navigace**: Chybí sidebar nebo tab navigace pro různé oblasti
- **Funkcionalita**: Mnoho admin funkcí není implementováno nebo je obtížně dostupné
- **UX/UI**: Chybí moderní design, responsive layout, intuitivní ovládání
- **Workflow**: Admin operace nejsou optimalizované pro efektivitu

## 🏗️ Nová architektura dashboardu

### 1. Hlavní navigační struktura
```
📊 Dashboard (Přehled)
├── 🎯 Mission Control (KPI metriky)
├── 📈 Analytics (Analýzy a reporty)
└── 🔔 Notifications (Notifikace)

👥 User Management (Správa uživatelů)
├── 👤 Users (Uživatelé)
├── 🏫 Schools (Školy)
├── 👨‍🏫 Teachers (Učitelé)
└── 🔐 Roles & Permissions (Role a oprávnění)

💰 Business & Finance (Business a finance)
├── 💳 Credits (Kredity)
├── 📊 Subscriptions (Předplatná)
├── 📈 Revenue Analytics (Analýza příjmů)
└── 💰 Billing (Fakturace)

🛠️ System Administration (Správa systému)
├── 🖥️ System Health (Zdraví systému)
├── 📊 Performance Metrics (Výkonnostní metriky)
├── 🔧 Configuration (Konfigurace)
└── 🚨 Monitoring & Alerts (Monitoring a upozornění)

📝 Content Management (Správa obsahu)
├── 📚 Materials (Materiály)
├── ✅ Moderation (Moderování)
├── 🏷️ Categories & Tags (Kategorie a tagy)
└── 📊 Content Analytics (Analýza obsahu)

🔒 Security & Compliance (Bezpečnost a compliance)
├── 🛡️ Security Settings (Bezpečnostní nastavení)
├── 📋 Audit Logs (Audit logy)
├── 🚫 Banned Content (Zakázaný obsah)
└── 📊 Security Analytics (Bezpečnostní analýzy)

⚙️ Developer Tools (Vývojářské nástroje)
├── 🚩 Feature Flags (Feature flagy)
├── 🔌 API Management (Správa API)
├── 🧪 Testing Tools (Testovací nástroje)
└── 📚 Documentation (Dokumentace)
```

## 🎨 Design systém a UI/UX

### 1. Layout a navigace
- **Sidebar navigace**: Pevná levá navigace s ikonami a názvy sekcí
- **Breadcrumbs**: Jasná navigační cesta pro každou stránku
- **Quick actions**: Rychlé akce v headeru (notifikace, profil, search)
- **Responsive design**: Mobile-first approach s collapsible sidebar

### 2. Komponenty
- **Cards**: Moderní karty s gradient pozadím a stíny
- **Tables**: Pokročilé tabulky s filtrováním, řazením, bulk actions
- **Charts**: Interaktivní grafy (recharts nebo Chart.js)
- **Modals**: Elegantní modaly pro akce a formuláře
- **Forms**: Moderní formuláře s validací a auto-save

### 3. Barevné schéma
- **Primary**: #4A90E2 (modrá)
- **Success**: #10B981 (zelená)
- **Warning**: #F59E0B (oranžová)
- **Error**: #EF4444 (červená)
- **Neutral**: #6B7280 (šedá)
- **Background**: #F8F9FA (světle šedá)

## 🚀 Implementační fáze

### Fáze 1: Nová architektura a navigace (2-3 dny)
1. **Vytvořit nový AdminLayout** s sidebar navigací
2. **Implementovat routing** pro všechny sekce
3. **Vytvořit základní komponenty** (AdminSidebar, AdminHeader, AdminBreadcrumbs)
4. **Implementovat state management** pro admin dashboard

### Fáze 2: Hlavní sekce - Mission Control (1-2 dny)
1. **Dashboard přehled** s KPI metrikami
2. **Real-time monitoring** systémového stavu
3. **Quick actions** pro nejčastější operace
4. **Notification center** s prioritizací

### Fáze 3: User Management sekce (2-3 dny)
1. **Users table** s pokročilými filtry a bulk actions
2. **Schools management** s detaily a statistikami
3. **Role management** s granular permissions
4. **User analytics** s grafy a reporty

### Fáze 4: Business & Finance sekce (2-3 dny)
1. **Credit management** s pokročilými nástroji
2. **Subscription management** s billing integrací
3. **Revenue analytics** s grafy a predikcemi
4. **Financial reports** s exportem

### Fáze 5: System Administration sekce (2-3 dny)
1. **System health dashboard** s real-time metrikami
2. **Performance monitoring** s alerting systémem
3. **Configuration management** s environment variables
4. **Backup & recovery** nástroje

### Fáze 6: Content Management sekce (2-3 dny)
1. **Materials overview** s moderováním
2. **Category management** s hierarchickou strukturou
3. **Content analytics** s usage patterns
4. **Quality metrics** s AI-powered insights

### Fáze 7: Security & Developer Tools (2-3 dny)
1. **Security dashboard** s threat monitoring
2. **Audit logs** s pokročilým filtrováním
3. **Feature flags** s A/B testing
4. **API documentation** s testing tools

## 📋 Detailní specifikace sekcí

### 1. 🎯 Mission Control (Dashboard)
```typescript
interface MissionControlData {
  systemStatus: 'healthy' | 'warning' | 'critical';
  uptime: number;
  activeUsers: number;
  newUsersToday: number;
  creditsUsedToday: number;
  revenueToday: number;
  criticalAlerts: Alert[];
  quickActions: QuickAction[];
}
```

**Komponenty:**
- SystemStatusCard - velká karta se stavem systému
- KPIGrid - grid s klíčovými metrikami
- AlertsPanel - panel s kritickými upozorněními
- QuickActionsBar - rychlé akce pro admina

### 2. 👥 User Management
```typescript
interface UserManagementData {
  users: User[];
  schools: School[];
  roles: Role[];
  permissions: Permission[];
  userStats: UserStatistics;
  schoolStats: SchoolStatistics;
}
```

**Funkce:**
- **Users Table**: Filtry (role, status, school, date), bulk actions, inline edit
- **Schools Overview**: Detaily škol, statistiky, teacher management
- **Role Editor**: Vizuální editor rolí s drag & drop permissions
- **User Analytics**: Grafy aktivit, growth, engagement

### 3. 💰 Business & Finance
```typescript
interface BusinessData {
  credits: CreditAnalytics;
  subscriptions: SubscriptionData[];
  revenue: RevenueMetrics;
  billing: BillingInfo;
  financialReports: FinancialReport[];
}
```

**Funkce:**
- **Credit Dashboard**: Celkový přehled, distribuce, usage patterns
- **Subscription Manager**: Plány, renewals, upgrades/downgrades
- **Revenue Analytics**: Grafy příjmů, predikce, customer lifetime value
- **Billing Center**: Faktury, platby, refunds

### 4. 🛠️ System Administration
```typescript
interface SystemData {
  health: SystemHealth;
  performance: PerformanceMetrics;
  configuration: SystemConfig;
  monitoring: MonitoringData;
  backups: BackupStatus;
}
```

**Funkce:**
- **Health Dashboard**: Real-time status všech služeb
- **Performance Monitor**: Response times, throughput, error rates
- **Config Manager**: Environment variables, feature toggles
- **Backup Manager**: Automatické zálohy, recovery tools

### 5. 📝 Content Management
```typescript
interface ContentData {
  materials: Material[];
  moderation: ModerationQueue;
  categories: Category[];
  analytics: ContentAnalytics;
  quality: QualityMetrics;
}
```

**Funkce:**
- **Materials Overview**: Přehled všech materiálů s filtry
- **Moderation Queue**: Fronta pro moderování s AI assistance
- **Category Manager**: Hierarchická správa kategorií
- **Content Analytics**: Usage patterns, popularity, effectiveness

### 6. 🔒 Security & Compliance
```typescript
interface SecurityData {
  securityStatus: SecurityStatus;
  auditLogs: AuditLog[];
  bannedContent: BannedItem[];
  securityMetrics: SecurityMetrics;
  compliance: ComplianceStatus;
}
```

**Funkce:**
- **Security Dashboard**: Přehled bezpečnostních incidentů
- **Audit Logs**: Detailní logy s pokročilým filtrováním
- **Content Moderation**: AI-powered detection, manual review
- **Compliance Reports**: GDPR, školní regulace

### 7. ⚙️ Developer Tools
```typescript
interface DeveloperData {
  featureFlags: FeatureFlag[];
  apiEndpoints: APIEndpoint[];
  testingTools: TestingTool[];
  documentation: DocumentationItem[];
}
```

**Funkce:**
- **Feature Flags**: Vizuální editor s A/B testing
- **API Manager**: Endpoint overview, rate limiting, documentation
- **Testing Suite**: API testing, load testing, integration tests
- **Dev Docs**: Kompletní dokumentace pro vývojáře

## 🎨 UI/UX komponenty

### 1. AdminSidebar
```typescript
interface AdminSidebarProps {
  sections: AdminSection[];
  activeSection: string;
  collapsed: boolean;
  onSectionChange: (section: string) => void;
  onToggleCollapse: () => void;
}
```

**Funkce:**
- Collapsible sidebar s ikonami
- Section grouping a separators
- Active state highlighting
- Mobile responsive s overlay

### 2. AdminHeader
```typescript
interface AdminHeaderProps {
  user: AdminUser;
  notifications: Notification[];
  quickActions: QuickAction[];
  onSearch: (query: string) => void;
  onNotificationClick: (id: string) => void;
}
```

**Funkce:**
- User profile dropdown
- Global search s autocomplete
- Notification center s badges
- Quick actions toolbar

### 3. DataTable
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  filters: FilterConfig[];
  pagination: PaginationConfig;
  bulkActions: BulkAction[];
  onRowSelect: (rows: T[]) => void;
  onBulkAction: (action: string, rows: T[]) => void;
}
```

**Funkce:**
- Pokročilé filtrování a řazení
- Bulk actions s confirmation
- Inline editing
- Export funkcionalita (CSV, Excel)

### 4. AnalyticsCharts
```typescript
interface ChartProps {
  data: ChartData;
  type: 'line' | 'bar' | 'pie' | 'area';
  options: ChartOptions;
  onDataPointClick: (point: DataPoint) => void;
}
```

**Funkce:**
- Interaktivní grafy s tooltips
- Zoom a pan funkcionalita
- Real-time data updates
- Responsive design

## 🔧 Backend rozšíření

### 1. Nové admin endpointy
```typescript
// Analytics endpoints
GET /api/admin/analytics/dashboard
GET /api/admin/analytics/users
GET /api/admin/analytics/revenue
GET /api/admin/analytics/content

// Enhanced user management
GET /api/admin/users/analytics
POST /api/admin/users/bulk-actions
GET /api/admin/users/export

// System management
GET /api/admin/system/performance
GET /api/admin/system/backups
POST /api/admin/system/backup
POST /api/admin/system/restart

// Content management
GET /api/admin/content/overview
GET /api/admin/content/quality-metrics
POST /api/admin/content/bulk-moderate

// Security & compliance
GET /api/admin/security/overview
GET /api/admin/security/audit-logs
POST /api/admin/security/ban-content
```

### 2. Real-time updates
```typescript
// WebSocket endpoints pro real-time dashboard
WS /api/admin/ws/dashboard-updates
WS /api/admin/ws/system-alerts
WS /api/admin/ws/user-activity
WS /api/admin/ws/content-moderation
```

### 3. Enhanced monitoring
```typescript
// System monitoring
interface SystemMetrics {
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  database: DatabaseMetrics;
  api: APIMetrics;
  errors: ErrorMetrics;
  performance: PerformanceMetrics;
}
```

## 📱 Responsive design

### 1. Breakpoint strategie
```css
/* Mobile first approach */
.sm: 640px   /* Small devices */
.md: 768px   /* Medium devices */
.lg: 1024px  /* Large devices */
.xl: 1280px  /* Extra large devices */
.2xl: 1536px /* 2X large devices */
```

### 2. Mobile optimalizace
- **Collapsible sidebar**: Overlay na mobile
- **Touch-friendly**: Velké tlačítka a touch targets
- **Swipe gestures**: Pro navigaci mezi sekcemi
- **Optimized tables**: Horizontal scroll na mobile

### 3. Desktop optimalizace
- **Multi-column layout**: Využití širokých obrazovek
- **Keyboard shortcuts**: Pro rychlé akce
- **Drag & drop**: Pro reorganizaci dashboardu
- **Multi-window**: Otevření více sekcí najednou

## 🧪 Testování

### 1. Unit testy
- **Komponenty**: Všechny admin komponenty
- **Hooks**: Admin hooks pro state management
- **Utils**: Helper funkce pro admin dashboard

### 2. Integration testy
- **API calls**: Všechny admin endpointy
- **State management**: Admin context a reducers
- **Navigation**: Routing mezi sekcemi

### 3. E2E testy
- **Admin workflows**: Kompletní admin procesy
- **Responsive testing**: Na různých zařízeních
- **Performance testing**: Dashboard performance

## 📚 Dokumentace

### 1. Admin User Guide
- **Screenshoty**: Vizuální návod pro adminy
- **Video tutorials**: Krátká demo videa
- **FAQ**: Časté otázky a odpovědi
- **Best practices**: Doporučení pro správu

### 2. Developer Documentation
- **Component API**: Props, events, methods
- **State management**: Jak funguje admin state
- **Styling guide**: CSS třídy a design systém
- **Extension guide**: Jak přidat nové sekce

## 🔒 Bezpečnost a compliance

### 1. Access control
- **Role-based access**: Granular permissions pro každou sekci
- **Audit logging**: Všechny admin akce jsou logovány
- **Session management**: Bezpečné admin sessions
- **IP restrictions**: Možnost omezit admin přístup

### 2. Data protection
- **PII handling**: Opatrné zacházení s osobními údaji
- **Data retention**: Automatické mazání starých dat
- **Encryption**: Šifrování citlivých dat
- **Backup security**: Zabezpečené zálohy

## 🚀 Deployment a monitoring

### 1. Environment variables
```bash
# Admin dashboard config
ADMIN_DASHBOARD_ENABLED=true
ADMIN_REAL_TIME_UPDATES=true
ADMIN_AUDIT_LOGGING=true
ADMIN_BACKUP_ENABLED=true
ADMIN_MONITORING_ENABLED=true

# Security
ADMIN_IP_WHITELIST=192.168.1.0/24,10.0.0.0/8
ADMIN_SESSION_TIMEOUT=3600
ADMIN_MAX_LOGIN_ATTEMPTS=5
```

### 2. Performance monitoring
- **Dashboard load time**: Cíl < 2 sekundy
- **Real-time updates**: < 100ms latency
- **Memory usage**: Optimalizace pro velké datové sady
- **Database queries**: Optimalizace admin queries

## 📋 Checklist pro dokončení

### Architektura a navigace
- [ ] Nový AdminLayout s sidebar navigací
- [ ] Routing pro všechny sekce
- [ ] State management pro admin dashboard
- [ ] Responsive design pro mobile/desktop

### Hlavní sekce
- [ ] Mission Control dashboard
- [ ] User Management sekce
- [ ] Business & Finance sekce
- [ ] System Administration sekce
- [ ] Content Management sekce
- [ ] Security & Compliance sekce
- [ ] Developer Tools sekce

### Funkcionalita
- [ ] Real-time updates a monitoring
- [ ] Pokročilé tabulky s filtry
- [ ] Analytics grafy a reporty
- [ ] Bulk actions a bulk operations
- [ ] Export/import funkcionalita
- [ ] Search a filtrování

### UI/UX
- [ ] Moderní design systém
- [ ] Responsive layout
- [ ] Accessibility features
- [ ] Keyboard shortcuts
- [ ] Touch gestures pro mobile

### Backend
- [ ] Nové admin API endpointy
- [ ] Real-time WebSocket support
- [ ] Enhanced monitoring
- [ ] Security a audit logging
- [ ] Performance optimalizace

### Testování
- [ ] Unit testy pro komponenty
- [ ] Integration testy pro API
- [ ] E2E testy pro workflows
- [ ] Performance testy
- [ ] Security testy

### Dokumentace
- [ ] Admin user guide
- [ ] Developer documentation
- [ ] API dokumentace
- [ ] Deployment guide

## 🎯 Očekávaný výsledek

Po implementaci bude admin dashboard:

1. **Intuitivní a efektivní** - Admini budou moci spravovat platformu rychle a efektivně
2. **Kompletní** - Všechny admin funkce budou dostupné na jednom místě
3. **Moderní** - Profesionální design s nejlepšími UX praktikami
4. **Responsive** - Funguje perfektně na všech zařízeních
5. **Extensible** - Snadno se rozšiřuje o nové funkce
6. **Secure** - Bezpečný přístup s audit loggingem
7. **Performant** - Rychlý a efektivní i s velkými datovými sadami

Admin dashboard se stane **jedním z nejlepších** v edtech sektoru, s funkcionalitou na úrovni enterprise řešení.

---

**Priorita**: Vysoká - klíčová pro správu platformy
**Obtížnost**: Vysoká - kompletní redesign s novou architekturou
**Časový odhad**: 15-20 dní (včetně testování a dokumentace)
**Závislosti**: Existující admin API, design systém, UI komponenty
