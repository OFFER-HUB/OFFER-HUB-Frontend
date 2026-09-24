# UI State Components

This document describes the standard components for handling loading, empty, and error states across the application.

## Overview

All pages that fetch data or display lists MUST use these components to handle different states consistently.

## Components

### 1. LoadingState

Used when content is being loaded.

```tsx
import { LoadingState, Skeleton, CardSkeleton, ListItemSkeleton } from "@/components/ui/LoadingState";

// Basic loading
<LoadingState message="Loading services..." />

// Card variant (with neumorphic styling)
<LoadingState variant="card" message="Loading..." />

// Inline variant (for smaller areas)
<LoadingState variant="inline" message="Loading..." />

// Fullscreen variant (for page transitions)
<LoadingState variant="fullscreen" message="Loading application..." />

// Skeleton placeholders
<CardSkeleton />
<ListItemSkeleton />
<Skeleton variant="text" className="w-1/2 h-4" />
<Skeleton variant="circular" className="w-10 h-10" />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| message | string | "Loading..." | Text to display |
| variant | "default" \| "card" \| "inline" \| "fullscreen" | "default" | Visual style |

### 2. EmptyState

Used when a list or content area has no items to display.

```tsx
import { EmptyState } from "@/components/ui/EmptyState";
import { ICON_PATHS } from "@/components/ui/Icon";

// Basic empty state
<EmptyState
  icon={ICON_PATHS.briefcase}
  message="No services found"
/>

// With title and action button
<EmptyState
  icon={ICON_PATHS.briefcase}
  title="No services yet"
  message="Create your first service to start receiving orders"
  actionLabel="Create Service"
  onAction={() => router.push("/app/freelancer/services/new")}
/>

// With link instead of button
<EmptyState
  icon={ICON_PATHS.chat}
  title="No messages"
  message="Start a conversation with a client"
  linkHref="/app/chat"
  linkText="Go to Messages"
/>

// Card variant
<EmptyState
  variant="card"
  icon={ICON_PATHS.users}
  title="No orders"
  message="Orders will appear here"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | string | required | Icon path from ICON_PATHS |
| title | string | - | Optional heading |
| message | string | required | Description text |
| actionLabel | string | - | Button text |
| onAction | () => void | - | Button click handler |
| linkHref | string | - | Link URL |
| linkText | string | - | Link text |
| variant | "default" \| "card" | "default" | Visual style |

### 3. ErrorState

Used when an error occurs while loading or processing data.

```tsx
import { ErrorState } from "@/components/ui/ErrorState";

// Basic error with retry
<ErrorState
  message="Failed to load services"
  onRetry={() => refetch()}
/>

// Custom title and retry label
<ErrorState
  title="Connection Error"
  message="Unable to connect to the server. Please check your internet connection."
  onRetry={() => refetch()}
  retryLabel="Retry Connection"
/>

// Inline variant (for sections within a page)
<ErrorState
  variant="inline"
  message="Failed to load orders"
  onRetry={() => refetchOrders()}
/>

// Card variant
<ErrorState
  variant="card"
  title="Error"
  message="Something went wrong"
  onRetry={handleRetry}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | "Something went wrong" | Error heading |
| message | string | "An error occurred..." | Error description |
| onRetry | () => void | - | Retry button handler |
| retryLabel | string | "Try Again" | Retry button text |
| variant | "default" \| "card" \| "inline" | "default" | Visual style |

### 4. LoadingSpinner

Used for inline loading indicators.

```tsx
import { LoadingSpinner } from "@/components/ui/Icon";

// Different sizes
<LoadingSpinner size="sm" />  // 16px
<LoadingSpinner size="md" />  // 20px (default)
<LoadingSpinner size="lg" />  // 24px
<LoadingSpinner size="xl" />  // 32px

// With custom color
<LoadingSpinner className="text-primary" />
```

## Usage Guidelines

### When to Use Each Component

| Scenario | Component |
|----------|-----------|
| Page is loading data | `LoadingState` |
| Section within page is loading | `LoadingState variant="inline"` |
| Full page transition | `LoadingState variant="fullscreen"` |
| List has no items | `EmptyState` |
| Search returned no results | `EmptyState` with search-related message |
| API request failed | `ErrorState` with retry |
| Network error | `ErrorState` with connection message |
| Button is submitting | `LoadingSpinner` inside button |

### Standard Pattern for Data Fetching

```tsx
function MyListPage() {
  const [data, setData] = useState<Item[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getData();
      setData(result);
    } catch (e) {
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Loading state
  if (isLoading) {
    return <LoadingState message="Loading items..." />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={ICON_PATHS.list}
        title="No items"
        message="Create your first item to get started"
        actionLabel="Create Item"
        onAction={() => router.push("/new")}
      />
    );
  }

  // Success - render data
  return (
    <div>
      {data.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  );
}
```

## Pages Requiring State Components

### Must Have EmptyState:
- Services list (`/app/freelancer/services`) - when no services
- Orders section in service detail - when no orders
- Disputes list (`/app/freelancer/disputes`) - when no disputes
- Chat list (`/app/chat`) - when no conversations
- Portfolio (`/app/freelancer/portfolio`) - when no portfolio items

### Should Have Loading/Error States (when API integration is added):
- All list pages
- All detail pages
- All forms with async submission

## Accessibility

All state components include proper ARIA attributes:
- `role="status"` for loading states
- `role="alert"` for error states
- Proper `aria-label` on spinners
- Screen reader announcements for state changes
