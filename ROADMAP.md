# ROADMAP - OFFER-HUB-Frontend

Lista de issues pendientes organizados por módulo. Cada issue es 100% independiente y solo depende de su contraparte en el API.

---

## AUTH Module

### FE-001: Implement Password Reset UI
- Página `/forgot-password` con formulario de email
- Página `/reset-password?token=xxx` para nueva contraseña
- Validación de formularios
- Mensajes de éxito/error
- Redirección a login tras reset exitoso

**Archivos**:
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/lib/api/auth.ts` - Agregar `forgotPassword()`, `resetPassword()`

**Dependencia API**: API-001

---

### FE-002: Implement Email Verification UI
- Banner en dashboard si email no verificado
- Botón "Reenviar verificación"
- Página `/verify-email?token=xxx`
- Toast de confirmación

**Archivos**:
- `src/components/auth/EmailVerificationBanner.tsx`
- `src/app/(auth)/verify-email/page.tsx`
- `src/lib/api/auth.ts` - Agregar `sendVerification()`, `verifyEmail()`

**Dependencia API**: API-002

---

### FE-003: Implement Session Management UI
- Página `/app/settings/sessions`
- Lista de sesiones activas con device info
- Botón "Cerrar sesión" por cada una
- Botón "Cerrar todas las sesiones"
- Confirmación modal

**Archivos**:
- `src/app/app/settings/sessions/page.tsx`
- `src/components/settings/SessionCard.tsx`
- `src/lib/api/auth.ts` - Agregar `getSessions()`, `deleteSession()`, `deleteAllSessions()`

**Dependencia API**: API-003

---

### FE-004: Implement Change Password UI
- Sección en `/app/settings/security`
- Formulario: contraseña actual, nueva, confirmar
- Validación de requisitos de contraseña
- Toast de confirmación

**Archivos**:
- `src/app/app/settings/security/page.tsx`
- `src/components/settings/ChangePasswordForm.tsx`
- `src/lib/api/auth.ts` - Agregar `changePassword()`

**Dependencia API**: API-004

---

## PROFILE Module

### FE-005: Implement Profile Completeness UI
- Componente `ProfileCompleteness` con barra de progreso
- Lista de campos faltantes con links
- Mostrar en sidebar o dashboard
- Gamificación visual

**Archivos**:
- `src/components/profile/ProfileCompleteness.tsx`
- `src/lib/api/users.ts` - Agregar `getProfileCompleteness()`

**Dependencia API**: API-005

---

### FE-006: Implement Skills Management UI
- Sección en `/app/profile/edit`
- Input con autocompletado de skills
- Tags editables con nivel (Beginner, Intermediate, Expert)
- Drag and drop para reordenar

**Archivos**:
- `src/components/profile/SkillsManager.tsx`
- `src/components/profile/SkillTag.tsx`
- `src/lib/api/users.ts` - Agregar `getSkills()`, `addSkill()`, `removeSkill()`

**Dependencia API**: API-006

---

### FE-007: Implement Availability Settings UI
- Sección en `/app/profile/edit`
- Toggle "Disponible para trabajar"
- Input "Horas por semana"
- Selector de timezone
- Horarios preferidos

**Archivos**:
- `src/components/profile/AvailabilitySettings.tsx`
- `src/lib/api/users.ts` - Agregar `getAvailability()`, `updateAvailability()`

**Dependencia API**: API-007

---

## PORTFOLIO Module

### FE-008: Implement Portfolio CRUD UI
- Página `/app/portfolio`
- Grid de proyectos con thumbnails
- Modal/página para crear/editar proyecto
- Formulario: título, descripción, links, tags
- Confirmación de eliminación

**Archivos**:
- `src/app/app/portfolio/page.tsx`
- `src/app/app/portfolio/new/page.tsx`
- `src/app/app/portfolio/[id]/edit/page.tsx`
- `src/components/portfolio/PortfolioCard.tsx`
- `src/components/portfolio/PortfolioForm.tsx`
- `src/lib/api/portfolio.ts`

**Dependencia API**: API-008

---

### FE-009: Implement Portfolio Image Upload UI
- Dropzone en formulario de portfolio
- Preview de imágenes
- Reordenar imágenes
- Eliminar imágenes
- Progress bar de upload

**Archivos**:
- `src/components/portfolio/ImageUploader.tsx`
- `src/components/portfolio/ImageGallery.tsx`
- `src/lib/api/portfolio.ts` - Agregar `uploadImages()`, `deleteImage()`

**Dependencia API**: API-009

---

### FE-010: Implement Public Portfolio View
- Página `/marketplace/freelancers/[id]/portfolio`
- Gallery con lightbox
- Links a proyectos externos
- Navegación entre proyectos

**Archivos**:
- `src/app/marketplace/freelancers/[id]/portfolio/page.tsx`
- `src/components/portfolio/PortfolioGallery.tsx`

**Dependencia API**: API-010

---

## CHAT Module

### FE-011: Implement Chat UI Base
- Página `/app/messages`
- Sidebar con lista de conversaciones
- Preview de último mensaje
- Badge de mensajes no leídos
- Ordenar por actividad reciente

**Archivos**:
- `src/app/app/messages/page.tsx`
- `src/components/chat/ConversationList.tsx`
- `src/components/chat/ConversationItem.tsx`
- `src/lib/api/chat.ts`
- `src/stores/chat-store.ts`

**Dependencia API**: API-011

---

### FE-012: Implement Message Thread UI
- Vista de mensajes en `/app/messages/[conversationId]`
- Input de mensaje con submit
- Scroll automático a nuevos mensajes
- Timestamps
- Indicador de envío

**Archivos**:
- `src/app/app/messages/[id]/page.tsx`
- `src/components/chat/MessageThread.tsx`
- `src/components/chat/MessageInput.tsx`
- `src/components/chat/MessageBubble.tsx`

**Dependencia API**: API-012

---

### FE-013: Implement Real-time Chat
- Conexión SSE para mensajes en tiempo real
- Actualización automática de lista
- Indicador "escribiendo..."
- Reconexión automática

**Archivos**:
- `src/hooks/useChatSSE.ts`
- `src/components/chat/TypingIndicator.tsx`

**Dependencia API**: API-013

---

### FE-014: Implement Read Receipts UI
- Checkmarks en mensajes (enviado, leído)
- Marcar como leído al ver
- Actualizar badge de no leídos

**Archivos**:
- `src/components/chat/ReadReceipt.tsx`
- `src/hooks/useMarkAsRead.ts`

**Dependencia API**: API-014

---

### FE-015: Implement Chat Attachments UI
- Botón de adjuntar archivo
- Preview de archivo antes de enviar
- Mostrar attachments en mensajes
- Descargar attachments

**Archivos**:
- `src/components/chat/AttachmentButton.tsx`
- `src/components/chat/AttachmentPreview.tsx`
- `src/components/chat/MessageAttachment.tsx`

**Dependencia API**: API-015

---

## NOTIFICATIONS Module

### FE-016: Implement Notifications UI
- Dropdown de notificaciones en navbar
- Lista con icono, título, tiempo
- Marcar como leída al hacer clic
- "Marcar todas como leídas"
- Badge contador

**Archivos**:
- `src/components/notifications/NotificationDropdown.tsx`
- `src/components/notifications/NotificationItem.tsx`
- `src/lib/api/notifications.ts`
- `src/stores/notification-store.ts`

**Dependencia API**: API-016

---

### FE-017: Implement Real-time Notifications
- Conexión SSE para notificaciones
- Toast al recibir nueva notificación
- Sonido opcional
- Actualizar badge en tiempo real

**Archivos**:
- `src/hooks/useNotificationSSE.ts`
- `src/components/notifications/NotificationToast.tsx`

**Dependencia API**: API-018

---

### FE-018: Implement Notification Preferences UI
- Página `/app/settings/notifications`
- Toggles por tipo de notificación
- Opciones: email, push, in-app

**Archivos**:
- `src/app/app/settings/notifications/page.tsx`
- `src/components/settings/NotificationPreferences.tsx`

**Dependencia API**: API-019

---

## REVIEWS Module

### FE-019: Implement Leave Review UI
- Modal después de completar order
- Rating con estrellas (1-5)
- Textarea para comentario
- Botón submit

**Archivos**:
- `src/components/reviews/LeaveReviewModal.tsx`
- `src/components/reviews/StarRating.tsx`
- `src/lib/api/reviews.ts`

**Dependencia API**: API-020

---

### FE-020: Implement Review Response UI
- Formulario de respuesta en review recibido
- Mostrar respuesta debajo del review
- Solo owner puede responder

**Archivos**:
- `src/components/reviews/ReviewResponse.tsx`
- `src/components/reviews/ReviewResponseForm.tsx`

**Dependencia API**: API-021

---

### FE-021: Implement Public Reviews View
- Sección de reviews en perfil público
- Filtros: rating, fecha
- Paginación
- Rating promedio destacado

**Archivos**:
- `src/app/marketplace/freelancers/[id]/reviews/page.tsx`
- `src/components/reviews/ReviewList.tsx`
- `src/components/reviews/ReviewCard.tsx`
- `src/components/reviews/RatingStats.tsx`

**Dependencia API**: API-022

---

## DISPUTES Module

### FE-022: Implement Open Dispute UI
- Botón "Abrir disputa" en order
- Modal con formulario: razón, descripción
- Confirmación de apertura

**Archivos**:
- `src/components/disputes/OpenDisputeModal.tsx`
- `src/lib/api/disputes.ts`

**Dependencia API**: API-023

---

### FE-023: Implement Dispute Evidence Upload UI
- Sección en detalle de disputa
- Dropzone para archivos
- Lista de evidencias subidas
- Preview de imágenes/PDFs

**Archivos**:
- `src/components/disputes/EvidenceUploader.tsx`
- `src/components/disputes/EvidenceList.tsx`
- `src/components/disputes/EvidenceItem.tsx`

**Dependencia API**: API-024

---

### FE-024: Implement Disputes List and Detail UI
- Página `/app/disputes`
- Lista de disputas del usuario
- Página `/app/disputes/[id]` con detalle
- Timeline de estados
- Resolución final

**Archivos**:
- `src/app/app/disputes/page.tsx`
- `src/app/app/disputes/[id]/page.tsx`
- `src/components/disputes/DisputeCard.tsx`
- `src/components/disputes/DisputeTimeline.tsx`

**Dependencia API**: API-025

---

## WALLET Module

### FE-025: Implement Wallet Dashboard UI
- Página `/app/wallet`
- Balance disponible y reservado
- Gráfico de ingresos/gastos
- Transacciones recientes
- Estadísticas del mes

**Archivos**:
- `src/app/app/wallet/page.tsx`
- `src/components/wallet/BalanceCard.tsx`
- `src/components/wallet/BalanceChart.tsx`
- `src/components/wallet/RecentTransactions.tsx`
- `src/lib/api/wallet.ts`

**Dependencia API**: API-026

---

### FE-026: Implement Transaction History UI
- Página `/app/wallet/transactions`
- Tabla/lista de transacciones
- Filtros: tipo, fecha, monto
- Paginación
- Exportar a CSV

**Archivos**:
- `src/app/app/wallet/transactions/page.tsx`
- `src/components/wallet/TransactionList.tsx`
- `src/components/wallet/TransactionFilters.tsx`
- `src/components/wallet/TransactionItem.tsx`

**Dependencia API**: API-027

---

### FE-027: Implement Withdrawal UI
- Modal/página de retiro
- Input de monto
- Validación vs balance disponible
- Selección de método
- Confirmación

**Archivos**:
- `src/components/wallet/WithdrawModal.tsx`
- `src/components/wallet/WithdrawForm.tsx`

**Dependencia API**: API-028

---

## DASHBOARD Module

### FE-028: Implement Freelancer Dashboard
- Página `/app/dashboard` para freelancers
- Cards: aplicaciones activas, orders, ingresos, rating
- Ofertas recomendadas
- Actividad reciente

**Archivos**:
- `src/app/app/dashboard/page.tsx`
- `src/components/dashboard/FreelancerDashboard.tsx`
- `src/components/dashboard/StatsCard.tsx`
- `src/components/dashboard/RecommendedOffers.tsx`
- `src/lib/api/dashboard.ts`

**Dependencia API**: API-029

---

### FE-029: Implement Client Dashboard
- Dashboard para clientes
- Cards: ofertas activas, aplicaciones pendientes, orders, gastos
- Freelancers recomendados
- Actividad reciente

**Archivos**:
- `src/components/dashboard/ClientDashboard.tsx`
- `src/components/dashboard/RecommendedFreelancers.tsx`

**Dependencia API**: API-030

---

## SETTINGS Module

### FE-030: Implement User Preferences UI
- Página `/app/settings/preferences`
- Selector de idioma
- Selector de timezone
- Selector de moneda
- Selector de tema (light/dark)

**Archivos**:
- `src/app/app/settings/preferences/page.tsx`
- `src/components/settings/PreferencesForm.tsx`
- `src/lib/api/settings.ts`

**Dependencia API**: API-031

---

### FE-031: Implement Notification Preferences UI
- Matriz de preferencias por tipo y canal
- Toggles organizados por sección
- Guardar automático

**Archivos**:
- `src/components/settings/NotificationMatrix.tsx`

**Dependencia API**: API-032

---

### FE-032: Implement Account Deletion UI
- Sección en `/app/settings/account`
- Botón "Eliminar cuenta"
- Modal de confirmación con input de password
- Warning sobre datos perdidos

**Archivos**:
- `src/app/app/settings/account/page.tsx`
- `src/components/settings/DeleteAccountModal.tsx`

**Dependencia API**: API-033

---

## SEARCH Module

### FE-033: Implement Advanced Search UI
- Página `/search`
- Input de búsqueda
- Sidebar de filtros
- Tabs: Ofertas, Servicios, Freelancers
- Grid de resultados
- Ordenamiento

**Archivos**:
- `src/app/search/page.tsx`
- `src/components/search/SearchInput.tsx`
- `src/components/search/SearchFilters.tsx`
- `src/components/search/SearchResults.tsx`
- `src/lib/api/search.ts`

**Dependencia API**: API-034

---

### FE-034: Implement Search Suggestions UI
- Dropdown de sugerencias mientras escribe
- Búsquedas populares
- Búsquedas recientes del usuario
- Keyboard navigation

**Archivos**:
- `src/components/search/SearchSuggestions.tsx`
- `src/hooks/useSearchSuggestions.ts`

**Dependencia API**: API-035

---

## FAVORITES Module

### FE-035: Implement Favorites UI
- Botón de favorito en cards (corazón)
- Página `/app/favorites`
- Tabs: Ofertas, Servicios, Freelancers
- Gestión de favoritos

**Archivos**:
- `src/components/ui/FavoriteButton.tsx`
- `src/app/app/favorites/page.tsx`
- `src/components/favorites/FavoritesList.tsx`
- `src/lib/api/favorites.ts`
- `src/stores/favorites-store.ts`

**Dependencia API**: API-036

---

## ANALYTICS Module

### FE-036: Implement Profile Views UI
- Card en dashboard de freelancer
- Gráfico de vistas por día
- Comparativa con período anterior

**Archivos**:
- `src/components/analytics/ProfileViewsCard.tsx`
- `src/components/analytics/ViewsChart.tsx`
- `src/lib/api/analytics.ts`

**Dependencia API**: API-037

---

### FE-037: Implement Earnings Analytics UI
- Página `/app/analytics/earnings`
- Gráfico de ingresos por mes
- Breakdown por cliente
- Breakdown por servicio
- Comparativas

**Archivos**:
- `src/app/app/analytics/page.tsx`
- `src/components/analytics/EarningsChart.tsx`
- `src/components/analytics/EarningsBreakdown.tsx`

**Dependencia API**: API-038

---

## ADMIN Module

### FE-038: Implement Admin Users UI
- Página `/admin/users`
- Tabla de usuarios con búsqueda
- Acciones: ver, editar, banear/desbanear
- Modal de edición
- Confirmación de ban

**Archivos**:
- `src/app/admin/users/page.tsx`
- `src/components/admin/UsersTable.tsx`
- `src/components/admin/UserEditModal.tsx`
- `src/components/admin/BanUserModal.tsx`
- `src/lib/api/admin.ts`

**Dependencia API**: API-039

---

### FE-039: Implement Admin Disputes UI
- Página `/admin/disputes`
- Lista de disputas abiertas
- Detalle de disputa con evidencias
- Formulario de resolución

**Archivos**:
- `src/app/admin/disputes/page.tsx`
- `src/app/admin/disputes/[id]/page.tsx`
- `src/components/admin/DisputeResolutionForm.tsx`

**Dependencia API**: API-040

---

### FE-040: Implement Admin Analytics UI
- Página `/admin/analytics`
- Dashboard con métricas de plataforma
- Usuarios activos, transacciones, ingresos
- Gráficos de tendencias

**Archivos**:
- `src/app/admin/analytics/page.tsx`
- `src/components/admin/PlatformStats.tsx`
- `src/components/admin/TrendsChart.tsx`

**Dependencia API**: API-041

---

## Prioridad de Implementación

### Alta Prioridad
1. FE-001 - Password Reset
2. FE-011 - Chat UI Base
3. FE-012 - Message Thread
4. FE-016 - Notifications UI
5. FE-019 - Leave Review
6. FE-025 - Wallet Dashboard

### Media Prioridad
7. FE-008 - Portfolio CRUD
8. FE-022 - Open Dispute
9. FE-028 - Freelancer Dashboard
10. FE-029 - Client Dashboard
11. FE-033 - Advanced Search

### Baja Prioridad
12. FE-035 - Favorites
13. FE-036 - Profile Views
14. FE-038 - Admin Users
