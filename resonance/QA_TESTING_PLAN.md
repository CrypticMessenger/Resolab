# QA Testing Plan: Kymatic Spatial Audio

This document outlines the manual testing procedures to ensure the quality and stability of the Kymatic application.

## 1. Authentication & User Session
| ID | Test Case | Action | Expected Result |
|----|-----------|--------|-----------------|
| A-01 | Sign In (Google) | Click "Sign in with Google" on landing page. | Redirects to Google auth, then back to `/dashboard`. Avatar appears in header. |
| A-02 | Sign Out | Click user avatar -> Log Out. | Session clears, redirects to Landing Page (`/`). |
| A-03 | Persisted Session | Close tab -> Reopen `/dashboard`. | User remains logged in without re-authenticating. |
| A-04 | Protected Route | Access `/dashboard` while logged out. | Redirects immediately to `/` (Landing Page). |

## 2. Dashboard & Project Management
| ID | Test Case | Action | Expected Result |
|----|-----------|--------|-----------------|
| D-01 | View Projects | Load Dashboard. | List of existing projects appears. Loading state is brief. |
| D-02 | Create Project | Click "Create New", enter name, confirm. | New card appears. User valid for creation (limit check passed). Redirects to Editor. |
| D-03 | Edit Project Name | Hover card -> Click Pencil -> Rename -> Save. | Card updates immediately with new name. |
| D-04 | Delete Project | Hover card -> Click Trash -> Confirm. | Project removed from grid. Backend row deleted. |
| D-05 | Search Projects | Type in search bar. | Grid filters in real-time to match project names. |

## 3. Spatial Audio Editor (Core)
| ID | Test Case | Action | Expected Result |
|----|-----------|--------|-----------------|
| E-01 | Scene Rendering | Open Project. | 3D Scene renders (Grid, Head model). No WebGL errors in console. |
| E-02 | Add Audio Source | Click "Add Source" (bottom toolbar). | New colored sphere appears in scene. Source list increments. |
| E-03 | Select Source | Click sphere in 3D view OR item in Sidebar. | Source highlights. properties panel (Right) populates with source data. |
| E-04 | Move Source | Drag sphere or Update X/Y/Z inputs. | Object moves in 3D space. Real-time audio panning changes (if playing). |
| E-05 | Play/Pause | Click Global Play/Pause. | Audio playback toggles. Animation loop continues (visualizers active). |
| E-06 | File Upload | Select Source -> Upload Audio File. | File uploads to Supabase. UI shows progress. Playback switches to file. |
| E-07 | 3D Navigation | Left-click drag (Rotate), Right-click (Pan), Scroll (Zoom). | Camera moves smoothly around the head model. |
| E-08 | Timeline | Drag timeline scrubber. | Audio syncs to new timestamp. Visualizers update. |

## 4. Subscription & Payments (Polar.sh)
| ID | Test Case | Action | Expected Result |
|----|-----------|--------|-----------------|
| S-01 | Free Tier Indicator | Login as new user. | Dashboard badge says "Free Tier". "Upgrade" button visible. |
| S-02 | Limits (Free) | Try to create >2 projects OR >2 sources/scene. | "Upgrade" modal appears explaining the limit. Action blocked. |
| S-03 | Upgrade Flow | Click "Upgrade" -> Select Pro -> Pay (Sandbox). | Redirects to Polar Checkout -> Success Page -> Dashboard. |
| S-04 | Pro Activation | Complete S-03. | Dashboard badge updates to "Pro Plan". "Upgrade" button becomes "Manage". Limits lifted. |
| S-05 | Manage Sub | Click "Manage". | Opens Polar Customer Portal in new tab. |
| S-06 | Cancellation | Cancel via Polar Portal. | App continues usage until period end. Webhook `subscription.canceled` fires. |

## 5. Tier Implementations (Edge Config & Database)
| ID | Test Case | Action | Expected Result |
|----|-----------|--------|-----------------|
| T-01 | Storage Limit | Upload huge file (>30MB on Free). | Upload blocked. Error/Upgrade prompt appears. |
| T-02 | Dynamic Limits | Update Edge Config limits (e.g., maxSources=5). | Refresh App. New limit (5) is enforced immediately without code deploy. |
| T-03 | Expired User | Webhook `subscription.revoked` fires. | User downgraded to Free. Pro features (e.g., existing 10 sources) might be locked or read-only (depending on logic). |

## 6. Edge Cases
| ID | Test Case | Action | Expected Result |
|----|-----------|--------|-----------------|
| X-01 | Network Failure | Disconnect Wifi -> Try to Save Project. | UI should handle gracefully (toast error) or retry. |
| X-02 | Webhook Delay | Buy Pro -> Immediately check DB. | DB might lag by 1-2s. Frontend should ideally poll or wait for confirmation (currently relies on page load). |
## 7. Backend Verification (Database & Storage)
| ID | Test Case | Action | Database Assertion (SQL Check) | Storage Assertion |
|----|-----------|--------|--------------------------------|-------------------|
| B-01 | New User Subscription | Sign up new user. | `SELECT count(*) FROM user_subscriptions WHERE user_id = 'UUID'` -> Should be **0**. | N/A |
| B-02 | Pro Subscription | Complete Polar Checkout. | `SELECT tier, status FROM user_subscriptions WHERE user_id = 'UUID'` -> **'PRO', 'active'**. | N/A |
| B-03 | File Persistence | Upload audio file. | `SELECT total_files_count FROM user_usage WHERE user_id = 'UUID'` -> Increments by 1. | File exists in Supabase Storage bucket `audio-files`. URL is public/accessible. |
| B-04 | Subscription Cancel | User cancels in Polar. | `SELECT cancel_at_period_end FROM user_subscriptions WHERE user_id = 'UUID'` -> **true**. | N/A |
| B-05 | Subscription Revoke | Fraud/Refund event. | `SELECT tier, status FROM user_subscriptions` -> **'FREE', 'canceled/revoked'**. | N/A |
| B-06 | Duplicate Webhook | Replay `subscription.created` webhook. | `SELECT count(*) FROM user_subscriptions WHERE user_id = 'UUID'` -> **Still 1** (Unique Constraint works). | N/A |

### 🔍 Utility SQL for Verification
Run these in Supabase SQL Editor to verify state:

**Check User Tier:**
```sql
select u.email, s.tier, s.status, s.renews_at 
from auth.users u 
left join user_subscriptions s on u.id = s.user_id;
```

**Check Storage Usage:**
```sql
select u.email, us.total_files_count, pg_size_pretty(us.total_storage_bytes) as storage_used
from auth.users u
join user_usage us on u.id = us.user_id;
```
