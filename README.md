# بوت تقديم الإداريين 🤖

بوت Discord لإدارة تقديمات الإداريين مع نظام قبول ورفض متكامل.

## المميزات
- ✅ Embed تقديم احترافي مع اختيار القسم
- ✅ 3 أقسام: الإيفنتات، الدعم، الألعاب
- ✅ نموذج تقديم بـ 4 أسئلة
- ✅ روم أدمن خاص يعرض جميع التقديمات
- ✅ أزرار قبول ورفض للأدمن
- ✅ إشعار DM للمتقدم عند القبول أو الرفض
- ✅ إعطاء رتبة تلقائية عند القبول

---

## الإعداد على Railway

### 1. إنشاء البوت
1. اذهب إلى [Discord Developer Portal](https://discord.com/developers/applications)
2. اضغط **New Application** واختر اسماً
3. اذهب إلى **Bot** → اضغط **Add Bot**
4. انسخ الـ **Token**
5. اذهب إلى **OAuth2 → General** وانسخ الـ **Client ID**

### 2. صلاحيات البوت
في **Bot** → فعّل:
- `MESSAGE CONTENT INTENT`
- `SERVER MEMBERS INTENT`
- `PRESENCE INTENT`

### 3. دعوة البوت للسيرفر
استخدم هذا الرابط (ضع Client ID بدل `YOUR_CLIENT_ID`):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

### 4. الاستضافة على Railway
1. اذهب إلى [Railway.app](https://railway.app)
2. اضغط **New Project** → **Deploy from GitHub repo**
3. اختر هذا المستودع
4. اذهب إلى **Variables** وأضف:
   - `DISCORD_TOKEN` = توكن البوت
   - `CLIENT_ID` = Client ID من Developer Portal
5. اضغط **Deploy**

### 5. تسجيل الأوامر
بعد ما يشتغل البوت على Railway، اذهب إلى **Shell** وشغل:
```bash
node deploy-commands.js
```

---

## أوامر الإعداد (للأدمن فقط)

| الأمر | الوصف |
|-------|-------|
| `/setup-apply` | ينشئ embed التقديم في القناة الحالية |
| `/setup-admin` | يعين القناة الحالية كروم الأدمن |
| `/setup-role @رتبة` | يعين رتبة الإداري للمقبولين |
| `/status` | يعرض الإعدادات الحالية |

## طريقة الاستخدام

1. شغّل `/setup-apply` في روم التقديمات
2. شغّل `/setup-admin` في روم الأدمن
3. شغّل `/setup-role @رتبة` لتحديد الرتبة
4. **خلاص!** الأعضاء يقدرون يتقدموا والأدمن يراجع ويقبل أو يرفض
