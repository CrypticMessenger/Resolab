# Spaudio Pricing Strategy & Infrastructure Plan

> [!IMPORTANT]
> This document outlines a sustainable freemium pricing model designed to work within Supabase free tier constraints while providing clear upgrade incentives and a path to profitability.

## 📊 Revised Tier Structure (Infrastructure-Aware)

### 🆓 Free Tier — "Discovery"
**Target Audience**: Curious users, one-time experimenters, students

| Feature | Limit | Rationale |
|---------|-------|-----------|
| Audio Files per Project | **3 files max** | Enough for basic soundscapes (e.g., rain + thunder + music) |
| Total Storage Cap | **30MB** | Hard cap prevents abuse (~5-6 files total across all projects) |
| Max Projects | **2 projects** | Allows experimentation without excessive storage use |
| Audio Sources per Scene | **1 source** | Forces focus on core spatial audio concept ⭐ **Key upgrade driver** |
| Export Length | 60 seconds | Enough for one TikTok/Reel (validation + viral potential) |
| Export Format | WebM (compressed) | Reduces bandwidth costs |
| Export Storage | **None** (download immediately) | Exports generated on-demand, deleted after download |
| Exports per Month | 10 exports | Prevents abuse, encourages upgrade |
| Watermark | ✅ Yes | Brand visibility + conversion driver |
| Rendering Priority | Low | Non-paying users wait in queue |

**Cost to You**: ~$0.05-0.20 per user/month (storage + bandwidth + processing)

---

### 💎 Pro Tier — "Creator" ($12-15/month)
**Target Audience**: Content creators, YouTubers, podcasters, hobbyist musicians

| Feature | Limit | Rationale |
|---------|-------|-----------|
| Audio Palette Storage | **100MB** | ~15-20 audio files (sufficient for most creators) |
| Audio Sources per Scene | 10 sources | Rich, immersive soundscapes (dialogue + music + ambience + 7 effects) |
| Export Length | 5 minutes | Perfect for podcast clips, music snippets, YouTube intros |
| Export Formats | WAV, MP3, WebM | Professional quality options |
| Export Storage | **7 days** | Exports kept for 7 days, then deleted |
| Projects | Unlimited | Remove friction for paying customers |
| Exports per Month | Unlimited | No limits on paying customers |
| Watermark | ❌ No | Clean exports |
| Rendering Priority | High | Fast turnaround |
| **Bonus Features** | Export presets, Batch export | Workflow improvements |

**Cost to You**: ~$1-2 per user/month (Supabase Pro tier amortized + bandwidth)

**Margin**: $10-14 per user/month (77-93% margin) ✅

---

### 👑 Elite Tier — "Professional" ($39-49/month)
**Target Audience**: Professional sound designers, studios, agencies, filmmakers

| Feature | Limit | Rationale |
|---------|-------|-----------|
| Audio Palette Storage | **10GB** | Professional sound libraries (1,500-2,000 files) |
| Audio Sources per Scene | Unlimited | Complex soundscapes with dozens of layers |
| Export Length | Unlimited | Feature films, long-form content |
| Export Formats | All (WAV, FLAC, IMAF, Dolby Atmos) | Industry-standard formats |
| Export Storage | **30 days** | Recent exports available for re-download |
| Projects | Unlimited | — |
| Rendering Priority | Highest | Instant processing |
| **Bonus Features** | • API access<br>• Collaboration (3 team members)<br>• Version history<br>• Priority support | Professional workflow features |

**Cost to You**: ~$8-12 per user/month (dedicated resources + support)

**Margin**: $27-41 per user/month (69-83% margin) ✅

---

## 💰 Supabase Cost Analysis

### Free Tier Limits
| Resource | Supabase Free | Your Usage Strategy |
|----------|---------------|---------------------|
| Database | 500MB | Store only metadata, user data, project configs (~50-100MB) |
| Storage | 1GB | **This is your constraint** ⚠️ |
| Bandwidth | 5GB/month | Compressed WebM for free users |
| Edge Functions | 500K executions | Use for watermarking, format conversion |

### Scaling Trigger Points

> [!IMPORTANT]
> **New Storage Model**: Only audio palette (source files) stored permanently. Exports generated on-demand and deleted after download/expiry.

**Storage Calculation per User Type:**
- Free user: ~30MB average (audio palette only)
- Pro user: ~100MB average (larger sound library)
- Elite user: ~5GB average (professional libraries)

**Maximum Users on Supabase Free (1GB storage):**
- Free only: ~30 users (30MB each)
- Mixed: 20 free + 4 pro (~600MB + 400MB)
- **Recommended upgrade trigger**: 20 active free users OR 5 Pro users

---

## 🎯 Recommended Storage Strategy (Supabase Free Tier)

### Phase 1: Bootstrap (0-30 users, Months 1-3)
**Stay on Supabase Free Tier**

```
Free Users: Up to 30 accounts (30MB each = 900MB)
Pro Users: Up to 5-7 accounts (100MB each)
Elite Users: NOT VIABLE on free tier

Storage Policy:
✅ Audio Palette: 30MB max per free user (3 files or 30MB limit)
✅ Exports: Generate on-demand, auto-download, immediate deletion
✅ No export history stored
✅ No Pro/Elite tiers offered yet
```

**Key Advantage**: Audio palette storage is much smaller than export storage! A 60-second spatial audio export might be 5-10MB, but the source files are only 3-5MB total.

**Action Items:**
- [ ] Implement on-demand export generation (no storage)
- [ ] Force immediate download of exports
- [ ] Track audio palette storage per user
- [ ] Set hard cap: 30MB audio palette per free user
- [ ] Show "Pro coming soon" for users wanting more audio sources

---

### Phase 2: First Revenue (5-10 Pro users, Month 4+)
**Upgrade to Supabase Pro ($25/month)**

```
Supabase Pro Limits:
- Storage: 100GB
- Database: 8GB
- Bandwidth: 250GB/month

Supported Users (Audio Palette Storage):
✅ Free: Up to 1,000 users (30MB each = 30GB)
✅ Pro: Up to 500 users (100MB each = 50GB)  
✅ Elite: Up to 4 users (5GB each = 20GB)
✅ Total: ~100GB with mixed user base

Revenue Required to Break Even: 2-3 Pro users ($24-36/month)
```

**Key Insight**: With the new 100MB Pro limit, Supabase Pro can support **hundreds** of paying users before needing additional infrastructure!

**Action Items:**
- [ ] Upgrade to Supabase Pro when you get 3rd paying user
- [ ] Implement user dashboard showing audio palette storage usage
- [ ] Add storage cleanup tools (delete unused audio files)
- [ ] Enable Pro and Elite tiers
- [ ] Implement export expiry (7 days Pro, 30 days Elite)

---

### Phase 3: Growth (20+ Pro users, Month 12+)
**Consider Self-Hosted or Cloud Storage Hybrid**

```
Options:
1. Cloudflare R2: $0.015/GB/month (no egress fees)
2. AWS S3: $0.023/GB/month (+ egress costs)
3. Backblaze B2: $0.005/GB/month (great for cold storage)

Strategy: Store audio on R2, metadata on Supabase
- R2 Storage: 1TB = $15/month
- Supabase Pro: $25/month
- Total: $40/month infrastructure
- Supports: ~500 Pro users = $6,000-7,500/month revenue
```

---

## 🔥 Smart Storage Optimization Strategies

### 1. **Audio Palette Management** (Primary Storage)
```
Free Tier (30MB total cap):
- Max 3 audio files per project
- Max 2 projects
- 30MB total storage cap (hard limit across all projects)
- Enforce strict upload limits: 10MB per file
- Show storage meter: "Project 1: 3/3 files (21MB) | Total: 21/30MB used"
- Delete unused audio from palette when projects deleted
- Allow users to manage their audio palette

Pro Tier (1GB max):
- Max 10 audio sources per scene
- Up to 50MB per file
- Storage dashboard showing usage
- Cleanup suggestions for unused audio files

Elite Tier (10GB max):
- Unlimited sources per scene
- Up to 500MB per file (high-res audio)
- Advanced palette organization (folders, tags)
- Duplicate detection & smart cleanup
```

### 2. **Export Processing Pipeline** (Zero Storage)
```
1. User clicks "Export" → Generate on-demand
2. Process → Create spatial audio file
3. Auto-download → Immediate download starts
4. Delete → Export deleted from server immediately
5. (Optional) Re-export available if audio palette still exists

Free Tier:
- Exports: Generate and download (no storage)
- Re-export: User can re-generate anytime (from saved audio palette)

Pro Tier:
- Exports: Stored for 7 days (convenience feature)
- Download links valid for 7 days
- After 7 days: Can re-export from audio palette

Elite Tier:
- Exports: Stored for 30 days
- Export history with versions
- Bulk re-download of past exports
```

### 3. **File Size Optimization**
```
Free Tier:
- Input: Max 10MB per audio file (enforced at upload)
- Auto-conversion: Convert large files to optimized format
- Output: WebM Opus codec (50-70% smaller than MP3)
- Suggest compression before upload

Pro Tier:
- Input: Up to 50MB per file
- Output: WAV, MP3, WebM (user choice)
- Smart format suggestions based on use case

Elite Tier:
- Input: Up to 500MB per file (uncompressed audio)
- Output: All lossless formats (FLAC, WAV, IMAF)
- No compression required
```

### 4. **Abandoned Project Cleanup**
```
Free Tier:
- Projects inactive for 30 days → Warning email
- Projects inactive for 60 days → Auto-delete (frees audio palette storage)

Pro Tier:
- Projects inactive for 6 months → Warning email
- Projects inactive for 12 months → Archive suggestion

Elite Tier:
- No automatic deletion
- Optional archival to cold storage
```

---

## 💡 Why Audio Palette Storage is Brilliant

> [!TIP]
> This storage model is **significantly better** than storing exports. Here's why:

### **1. Better Economics**
- **Audio palette is smaller**: 3 source files (15MB) vs 1 export (50MB)
- **Scalability**: Can support 3-5x more users on same infrastructure
- **Lower costs**: Only pay for what users actively use, not transient exports

### **2. Better User Experience**
- **Re-export anytime**: Users can regenerate exports with different settings
- **Flexibility**: Change export format/length without re-uploading audio
- **Version control**: Iterate on scenes without storing multiple exports
- **Instant downloads**: No waiting for stored files, just download and done

### **3. Better Conversion Psychology**
- **Clear upgrade path**: "Need more audio sources? Upgrade to Pro!"
- **Tangible limitation**: Users hit audio palette limit (creative constraint) not export limits (arbitrary)
- **Value perception**: Users pay for creative capability (10 sources vs 1), not storage space

### **4. Better Infrastructure**
```
Traditional Model (Store Exports):
Free User: 3 projects × 50MB export each = 150MB
100 Free Users = 15GB storage needed

Audio Palette Model (Your Approach):
Free User: 30MB audio palette (reusable across projects)
100 Free Users = 3GB storage needed

Savings: 80% less storage! 🎉
```

### **5. Upgrade Trigger Example**
```
User Journey:
1. Create Project 1: Upload 3 audio files (rain, thunder, wind) → 21MB used
2. Create peaceful rain scene (1 source only) → Export & download
3. Want to add thunder for richer scene → Hit 1 source/scene limit ❌
4. See upgrade prompt: "Upgrade to Pro for 10 sources per scene"
5. Create Project 2: Upload 2 files (music, voiceover) → 9MB (30MB total reached)
6. Try to upload 3rd file → ❌ "30MB storage limit reached. Delete unused files or upgrade to Pro for 1GB!"
7. Upgrade to Pro → Can now use 10 sources per scene + 1GB storage!
8. Create complex soundscape with 8 layered sources → Download
9. Later: Re-export with different settings (audio palette still there)

Result: User hits CREATIVE LIMITATION (1 source/scene) before storage limit.
         User pays for CREATIVE CAPABILITY, not storage.
```

---

## 📈 Revenue & Cost Projections

### Monthly Breakdown

| Scenario | Free Users | Pro Users | Elite Users | Infrastructure Cost | Revenue | Profit | Margin |
|----------|-----------|-----------|-------------|-------------------|---------|--------|--------|
| **Month 1-3** | 10 | 0 | 0 | $0 (Free tier) | $0 | $0 | — |
| **Month 4-6** | 50 | 5 | 0 | $25 (Supabase Pro) | $60-75 | $35-50 | **58-66%** |
| **Month 7-12** | 200 | 20 | 2 | $40 (Supabase + R2) | $318-378 | $278-338 | **87-89%** |
| **Year 2** | 500 | 100 | 10 | $100 (Scaled infra) | $1,690-1,990 | $1,590-1,890 | **94-95%** |

**Key Insight**: SaaS margins improve dramatically with scale due to fixed infrastructure costs.

---

## 🎁 Alternative Tier: "Starter" (Optional)

Consider a middle tier to capture users who just want watermark removal:

### 💫 Starter Tier — "Hobbyist" ($5-7/month)
- **Audio Palette**: 100MB storage (~10-15 audio files)
- **Audio Sources per Scene**: 3 sources
- **Export Length**: 2 minutes
- **Export Formats**: MP3 + WebM formats
- **Export Storage**: 3 days retention
- **Watermark**: ❌ No
- **Projects**: Unlimited

**Target**: Users who just want watermark removal and slightly more creative freedom (3 sources vs 1).

**Storage Impact**: Minimal (100MB audio palette per user)

---

## 🛠️ Implementation Checklist

### Phase 1: Infrastructure Setup (Week 1)
- [ ] Implement storage tracking system
- [ ] Create cleanup jobs (exports, temp files, abandoned projects)
- [ ] Add storage quota enforcement
- [ ] Set up monitoring alerts (80% storage usage)
- [ ] Add user storage dashboard

### Phase 2: Free Tier (Week 2)
- [ ] Implement watermark on exports
- [ ] Implement audio palette tracking (3 files per project, 2 projects max, 30MB total cap)
- [ ] Add storage meter UI ("Project 1: 3/3 files (21MB) | Total: 21/30MB")
- [ ] Enforce 1 audio source per scene limit ⭐ **Primary conversion driver**
- [ ] Implement on-demand export generation (no storage)
- [ ] Limit exports to 10/month
- [ ] Track "Add source" button clicks when at limit (analytics)
- [ ] Add "Upgrade to use more audio sources" CTAs when hitting 1 source limit

### Phase 3: Pro Tier (Week 3-4)
- [ ] Implement Stripe/payment integration
- [ ] Build subscription management UI
- [ ] Add feature gating (check user tier)
- [ ] Create upgrade flows
- [ ] Set up webhook for subscription events

### Phase 4: Analytics (Week 4)
- [ ] Track feature usage by tier
- [ ] Monitor conversion funnel (Free → Pro)
- [ ] Storage usage per user/tier
- [ ] Export format preferences
- [ ] User retention metrics

---

## 🎯 Conversion Optimization Strategy

### Free → Pro Triggers
1. **Hit audio source limit** (1 source per scene) → "Upgrade to use 10 sources for richer soundscapes" ⭐ **PRIMARY TRIGGER**
2. **Hit audio palette limit** (3 files / 30MB) → "Upgrade for 1GB audio palette (200+ files)"
3. **Hit export limit** (10/month) → Show modal with Pro benefits
4. **Watermark friction** → "Remove watermark with Pro"
5. **Quality comparison** → A/B export preview (WebM vs WAV)
6. **In-app suggestions** → "This scene would sound amazing with layered rain + thunder + music. Upgrade to Pro to use 10 sources!"

**Key Insight**: The **1 source per scene** limitation is your strongest conversion driver. It's a creative constraint that makes users want to upgrade to realize their full creative vision.

### Pro → Elite Triggers
1. **Hit 10 sources per scene** → "Upgrade to Elite for unlimited sources"
2. **Hit 1GB audio palette** → "Upgrade to Elite for 10GB professional library"
3. **Advanced format needs** → "Export to Dolby Atmos/IMAF with Elite"
4. **API requests** → "Access API with Elite"
5. **Collaboration needs** → "Invite team members with Elite"
6. **Export history** → "Need exports stored for 30 days? Upgrade to Elite"

---

## 📊 Metrics to Track

### Critical KPIs
| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Free → Pro conversion | 3-7% | Revenue generation (higher because creative constraint is compelling) |
| Pro → Elite conversion | 10-15% | ARPU increase |
| Churn rate (Pro) | <5%/month | Retention |
| **Audio palette usage** | 60-80% of limit | Sweet spot for upgrade prompts |
| **Audio sources per scene** | Free: hitting 1 limit often | Validates upgrade need |
| Exports per user (Free) | 5-8/month | Engagement level |
| Time to first export | <5 minutes | Activation metric |
| **"Add source" click rate (Free)** | Track blocked attempts | Measures upgrade intent |

### Weekly Dashboard
```
Total Users: [Free] + [Pro] + [Elite]
MRR (Monthly Recurring Revenue): $___
Storage Usage: [X/100]GB
Bandwidth Usage: [X/250]GB
Conversion Rate: ___%
Churn: ___%
```

---

## 🚀 Go-to-Market Recommendation

### Pricing Launch Strategy

**Phase 1: Friends & Family (Month 1-2)**
- Free tier only
- Gather feedback
- Refine product
- **Goal**: 10 active users

**Phase 2: Soft Launch (Month 3-4)**
- Launch Pro tier at **50% discount** ($7.5/month)
- "Early adopter pricing - lock in forever"
- Limited to first 50 Pro users
- **Goal**: 5-10 Pro conversions

**Phase 3: Public Launch (Month 5+)**
- Full pricing: $12-15/month Pro, $39-49/month Elite
- Early adopters keep discounted rate (loyalty + testimonials)
- Content marketing (YouTube tutorials, case studies)
- **Goal**: 20+ Pro users

---

## 💡 Final Recommendations

### ✅ Immediate Actions

> [!IMPORTANT]
> Your audio palette storage model is **excellent** for SaaS economics. Here's how to implement it:

1. **Implement Audio Palette Storage Tracking**:
   - Free: 3 files per project, max 2 projects, 30MB total cap (whichever comes first)
   - Pro: Unlimited files per project, unlimited projects, 1GB total storage
   - Elite: Unlimited files, unlimited projects, 10GB total storage
   - Track per-user and per-project usage in database
   - Show clear storage breakdown by project

2. **Implement On-Demand Export Generation**:
   - Generate exports when user clicks "Export" button
   - Force immediate download (no server storage)
   - Optional: Cache for 7-30 days as premium feature
   - User can always re-export from saved audio palette

3. **Enforce Audio Source Limits per Scene**:
   - Free: Max 2 sources per scene (**⭐ Key upgrade driver**)
   - Pro: Max 10 sources per scene
   - Elite: Unlimited sources
   - Show upgrade prompt when user tries to add beyond limit

4. **Add Audio Palette UI**:
   - Project-level storage: "Project 1: 3/3 files (21MB)"
   - Total storage meter: "Total: 25/30MB used across 2 projects"
   - Manage palette: View all projects, delete unused files, see size per file
   - Upgrade prompt when approaching limits:
     - Per project: "Project full (3/3 files). Upgrade for unlimited files per project!"
     - Total: "25/30MB used. Upgrade to Pro for 1GB storage!"

5. **Start on Supabase Free** (can support 20-30 free users easily!)
   - Upgrade at 2 Pro users or 15-20 active free users
   - Much more runway than export-based storage

6. **Track "Add Source" attempts** in Free tier
   - This is your conversion signal
   - Users hitting 1 source limit = high upgrade intent

### 🎯 Success Metrics for Year 1
- 500 free users
- 50 Pro users ($600-750 MRR)
- 3-5 Elite users ($117-245 MRR)
- **Total MRR: $717-995/month**
- **Infrastructure cost: $40-100/month**
- **Net profit: $617-895/month** (86-90% margin)

---

## 🔗 Next Steps

1. Review and approve this pricing structure
2. Implement storage tracking and cleanup systems
3. Design upgrade flows and CTAs
4. Set up payment infrastructure (Stripe)
5. Create pricing page
6. Launch Free tier → Gather users → Launch paid tiers

**Question for you**: What monthly revenue target would make you comfortable upgrading to Supabase Pro ($25/month)?

*Recommended answer: 2 Pro users = $24-30/month = break-even point*
