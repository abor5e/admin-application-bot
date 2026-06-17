const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('setup-apply')
        .setDescription('إنشاء embed التقديم في هذه القناة')
        .setDefaultMemberPermissions(8),

    new SlashCommandBuilder()
        .setName('setup-admin')
        .setDescription('تعيين هذه القناة كروم الأدمن لعرض التقديمات')
        .setDefaultMemberPermissions(8),

    new SlashCommandBuilder()
        .setName('setup-role')
        .setDescription('تعيين رتبة الإداري التي تُعطى عند القبول')
        .setDefaultMemberPermissions(8)
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('الرتبة التي ستُعطى للمقبولين')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('status')
        .setDescription('عرض إعدادات البوت الحالية')
        .setDefaultMemberPermissions(8),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('⏳ جاري تسجيل الأوامر...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands.map(c => c.toJSON()) }
        );
        console.log('✅ تم تسجيل الأوامر بنجاح!');
    } catch (error) {
        console.error('❌ خطأ:', error);
    }
})();
