# Prompt: Oprava systému složek pro materiály v EduAI-Asistent

## 🎯 Cíl úkolu

Opravit a implementovat plně funkční systém složek pro materiály v EduAI-Asistent, který umožní:
- **CRUD operace na složkách** (vytvoření, čtení, aktualizace, mazání)
- **Sdílení složek se školou** (pro učitele ve stejné škole)
- **Přidávání vygenerovaných materiálů do složek**
- **Hierarchickou strukturu složek** (vnořené složky)
- **Správu přístupů a oprávnění**

## 🔍 Analýza současného stavu

### ✅ Co už je implementováno:
- Backend modely pro složky (`FolderModel`) a sdílené materiály (`SharedMaterialModel`)
- API endpointy pro složky (`/api/folders/*`)
- Frontend UI pro vytváření složek a správu materiálů
- Databázové schéma pro složky a sdílení
- Autentifikace a autorizace middleware

### ❌ Co nefunguje nebo chybí:
- **Frontend komponenty pro správu složek** (chybí folder manager, tree view)
- **Drag & Drop funkcionalita** pro přesouvání materiálů mezi složkami
- **Správné propojení** mezi složkami a materiály při generování
- **UI pro editaci a mazání složek**
- **Správa sdílení složek** (veřejné/soukromé, škola)
- **Validace a error handling** pro operace se složkami

## 🏗️ Technická specifikace

### Backend (Node.js + Express + TypeScript)

#### 1. Oprava FolderModel
```typescript
// Přidat chybějící metody:
- findWithMaterials(folderId: string): Promise<FolderWithMaterials>
- findSharedFoldersByUser(userId: string, schoolId: string): Promise<Folder[]>
- updateSharingSettings(folderId: string, settings: SharingSettings): Promise<Folder>
- getFolderStats(folderId: string): Promise<FolderStats>
- searchFolders(query: string, userId: string, schoolId?: string): Promise<Folder[]>
```

#### 2. Oprava API endpointů
```typescript
// Opravit a doplnit:
- GET /api/folders/:folderId/stats - statistiky složky
- PUT /api/folders/:folderId/sharing - nastavení sdílení
- POST /api/folders/:folderId/duplicate - duplikace složky
- GET /api/folders/search?q=query - vyhledávání složek
- POST /api/folders/:folderId/move - přesun složky (změna parent_folder_id)
```

#### 3. Validace a error handling
```typescript
// Přidat proper validaci:
- Název složky: min 1, max 255 znaků, unikátní v rámci parent složky
- Popis: max 1000 znaků
- Hierarchie: max 5 úrovní vnoření
- Sdílení: pouze pro uživatele ve stejné škole
```

### Frontend (React + TypeScript + Tailwind CSS)

#### 1. Nové komponenty
```typescript
// Vytvořit:
- FolderManager.tsx - hlavní komponenta pro správu složek
- FolderTree.tsx - stromová struktura složek
- FolderForm.tsx - formulář pro vytvoření/editaci složky
- FolderContextMenu.tsx - kontextové menu pro složky
- MaterialOrganizer.tsx - drag & drop organizér materiálů
- SharingSettingsModal.tsx - nastavení sdílení složky
```

#### 2. Oprava existujících komponent
```typescript
// Opravit:
- MyMaterialsPage.tsx - integrace s novým folder systémem
- DragDropMaterialsGrid.tsx - podpora pro složky
- MaterialDisplay.tsx - zobrazení složky materiálu
```

#### 3. State management
```typescript
// Přidat:
- useFolders hook pro správu stavu složek
- useFolderOperations hook pro CRUD operace
- useFolderSharing hook pro sdílení
- FolderContext pro globální stav složek
```

## 🚀 Implementační fáze

### Fáze 1: Backend opravy a rozšíření (1-2 dny)
1. **Opravit FolderModel** - doplnit chybějící metody
2. **Rozšířit API endpointy** - přidat nové funkcionality
3. **Implementovat validaci** - proper input validation
4. **Přidat error handling** - meaningful error messages
5. **Testovat backend** - unit a integration testy

### Fáze 2: Frontend komponenty (2-3 dny)
1. **Vytvořit FolderManager** - hlavní komponenta
2. **Implementovat FolderTree** - stromová struktura
3. **Vytvořit FolderForm** - formuláře pro CRUD
4. **Implementovat drag & drop** - pro materiály
5. **Přidat kontextové menu** - pro složky

### Fáze 3: Integrace a UI/UX (1-2 dny)
1. **Integrovat s MyMaterialsPage** - propojit komponenty
2. **Implementovat sdílení** - UI pro nastavení
3. **Přidat notifikace** - success/error messages
4. **Responsive design** - mobile-first approach
5. **Accessibility** - ARIA atributy, keyboard navigation

### Fáze 4: Testování a finální úpravy (1 den)
1. **End-to-end testy** - kompletní workflow
2. **Cross-browser testy** - Chrome, Firefox, Safari
3. **Mobile testy** - responsive design
4. **Performance testy** - lazy loading, optimizace
5. **Code review** - kvalita a konzistence

## 📋 Detailní požadavky na implementaci

### 1. CRUD operace na složkách

#### Vytvoření složky
- **Formulář**: název (povinné), popis (volitelné), parent složka (volitelné), sdílení (checkbox)
- **Validace**: název min 1 znak, max 255 znaků, unikátní v rámci parent složky
- **UI**: modal s formulářem, loading stav, error handling
- **Backend**: POST /api/folders s validací

#### Čtení složek
- **Hierarchie**: stromová struktura s vnořenými složkami
- **Filtry**: podle názvu, data vytvoření, sdílení
- **Vyhledávání**: real-time search v názvech složek
- **Pagination**: pro velké množství složek

#### Aktualizace složky
- **Inline edit**: dvojklik na název pro editaci
- **Modal edit**: pro složitější změny (popis, sdílení)
- **Validace**: stejná jako při vytváření
- **Optimistic update**: okamžitá změna v UI

#### Mazání složky
- **Kontrola**: pouze prázdné složky (bez materiálů a podsložek)
- **Confirmation**: modal s potvrzením
- **Cascade**: možnost smazat i s obsahem (volitelné)
- **Recovery**: možnost obnovit smazané složky (trash bin)

### 2. Sdílení složek se školou

#### Nastavení sdílení
- **Typy sdílení**: 
  - Soukromé (pouze vlastník)
  - Škola (všichni učitelé ve škole)
  - Veřejné (všichni uživatelé platformy)
- **Oprávnění**: 
  - Pouze pro čtení
  - Pro čtení a přidávání materiálů
  - Pro plnou správu (admin)
- **UI**: toggle switche, role selector, permission matrix

#### Sdílené složky
- **Zobrazení**: odlišení od vlastních složek (ikona, barva)
- **Přístup**: podle role uživatele
- **Aktivita**: historie změn, kdo co upravil
- **Notifikace**: při změnách v sdílených složkách

### 3. Přidávání materiálů do složek

#### Při generování
- **Výběr složky**: dropdown s možností vytvořit novou
- **Automatické přiřazení**: podle typu materiálu nebo předmětu
- **Smart suggestions**: AI doporučení pro organizaci

#### Organizace existujících materiálů
- **Drag & Drop**: přetahování mezi složkami
- **Bulk operations**: hromadné přesouvání
- **Quick organize**: rychlé přiřazení podle pravidel
- **Search & filter**: vyhledávání materiálů v složkách

#### Složka "Nevyorganizováno"
- **Default složka**: pro materiály bez přiřazení
- **Automatic cleanup**: návrhy na organizaci
- **Smart grouping**: automatické seskupování podobných materiálů

## 🎨 UI/UX požadavky

### Design systém
- **Barvy**: podle design_guidelines.md (primary #4A90E2, background #F8F9FA)
- **Typografie**: Inter font, konzistentní velikosti
- **Spacing**: Tailwind CSS spacing scale
- **Icons**: Lucide React icons

### Komponenty
- **Cards**: pro složky a materiály
- **Modals**: pro formuláře a nastavení
- **Dropdowns**: pro výběr složek a akcí
- **Tooltips**: pro pomocné informace
- **Loading states**: pro async operace

### Responsive design
- **Mobile-first**: začít s mobile verzí
- **Breakpoints**: sm, md, lg, xl
- **Touch friendly**: velké tlačítka pro mobile
- **Gesture support**: swipe pro akce

### Accessibility
- **ARIA labels**: pro screen readery
- **Keyboard navigation**: tab, enter, space
- **Focus management**: visible focus indicators
- **Color contrast**: WCAG AA compliance

## 🧪 Testování

### Unit testy
- **FolderModel**: všechny CRUD operace
- **API endpointy**: validace, error handling
- **React komponenty**: rendering, user interactions

### Integration testy
- **Folder workflow**: vytvoření → editace → sdílení → mazání
- **Material organization**: přidání → přesun → organizace
- **Sharing system**: nastavení → přístup → oprávnění

### E2E testy
- **Complete user journey**: od přihlášení po organizaci materiálů
- **Cross-browser**: Chrome, Firefox, Safari
- **Mobile testing**: responsive design, touch interactions

## 📚 Dokumentace

### API dokumentace
- **OpenAPI/Swagger**: kompletní specifikace endpointů
- **Request/Response examples**: praktické příklady
- **Error codes**: seznam všech možných chyb

### User guide
- **Screenshoty**: vizuální návod pro uživatele
- **Video tutorial**: krátké demo videa
- **FAQ**: časté otázky a odpovědi

### Developer docs
- **Component API**: props, events, methods
- **State management**: jak funguje folder context
- **Styling guide**: Tailwind CSS třídy a custom CSS

## 🔒 Bezpečnost a validace

### Input validation
- **Sanitization**: XSS protection
- **Length limits**: reasonable boundaries
- **Type checking**: proper TypeScript types
- **SQL injection**: parameterized queries

### Access control
- **Ownership check**: uživatel může editovat pouze své složky
- **School membership**: sdílení pouze v rámci školy
- **Role-based access**: admin vs teacher permissions
- **Audit log**: sledování změn

### Error handling
- **User-friendly messages**: v češtině, srozumitelné
- **Logging**: detailed server logs pro debugging
- **Graceful degradation**: fallback při chybách
- **Retry mechanisms**: pro transient failures

## 📱 Mobile experience

### Touch interactions
- **Long press**: kontextové menu
- **Swipe**: rychlé akce (smazat, sdílet)
- **Pinch to zoom**: pro detailní zobrazení
- **Pull to refresh**: aktualizace obsahu

### Performance
- **Lazy loading**: načítání složek podle potřeby
- **Virtual scrolling**: pro velké seznamy
- **Image optimization**: compressed thumbnails
- **Offline support**: základní funkcionalita offline

## 🚀 Deployment a monitoring

### Environment variables
```bash
# Backend
FOLDER_MAX_DEPTH=5
FOLDER_MAX_NAME_LENGTH=255
FOLDER_SHARING_ENABLED=true
FOLDER_AUDIT_LOGGING=true

# Frontend
REACT_APP_FOLDER_FEATURES_ENABLED=true
REACT_APP_FOLDER_DRAG_DROP_ENABLED=true
```

### Monitoring
- **Performance metrics**: response times, error rates
- **Usage analytics**: kolik složek se vytváří, sdílí
- **Error tracking**: Sentry nebo podobný nástroj
- **User feedback**: rating system pro složky

## 📋 Checklist pro dokončení

### Backend
- [ ] Opravené FolderModel s všemi metodami
- [ ] Rozšířené API endpointy
- [ ] Proper validace a error handling
- [ ] Unit a integration testy
- [ ] API dokumentace

### Frontend
- [ ] Vytvořené všechny komponenty
- [ ] Implementovaný drag & drop
- [ ] Responsive design
- [ ] Accessibility features
- [ ] Error handling a loading states

### Integrace
- [ ] Propojené s MyMaterialsPage
- [ ] Fungující sdílení složek
- [ ] Organizace materiálů
- [ ] Cross-browser kompatibilita
- [ ] Mobile experience

### Testování
- [ ] Unit testy pro backend
- [ ] Component testy pro frontend
- [ ] E2E testy pro workflow
- [ ] Performance testy
- [ ] Accessibility testy

### Dokumentace
- [ ] API dokumentace
- [ ] User guide
- [ ] Developer docs
- [ ] Deployment guide

## 🎯 Očekávaný výsledek

Po implementaci bude uživatel schopen:

1. **Vytvářet a spravovat složky** s intuitivním UI
2. **Organizovat materiály** pomocí drag & drop
3. **Sdílet složky se školou** s různými úrovněmi oprávnění
4. **Procházet hierarchickou strukturu** složek
5. **Vyhledávat a filtrovat** materiály v složkách
6. **Spravovat přístupy** k sdíleným složkám

Systém bude **responsive, accessible a performant** na všech zařízeních, s **konzistentním designem** podle design guidelines a **robustním backendem** s proper error handlingem.

---

**Priorita**: Vysoká - základní funkcionalita pro organizaci materiálů
**Obtížnost**: Střední - integrace existujících komponent s novými
**Časový odhad**: 5-8 dní (včetně testování a dokumentace)
**Závislosti**: Funkční backend API, existující UI komponenty
