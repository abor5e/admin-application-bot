const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message]
});

const CONFIG_FILE = path.join(__dirname, 'config.json');

function loadConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        return { applicationChannelId: null, adminChannelId: null, staffRoleId: null, guildId: null };
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

const SECTIONS = {
    event: 'قسم الإيفنتات 🎉',
    support: 'قسم الدعم 🛡️',
    games: 'قسم الألعاب 🎮'
};

const QUESTIONS = [
    { id: 'name', label: 'وش اسمك؟', placeholder: 'اكتب اسمك هنا...' },
    { id: 'age', label: 'كم عمرك؟', placeholder: 'مثلاً: 18' },
    { id: 'activity', label: 'كيف تفاعلك داخل السيرفر؟', placeholder: 'صف مستوى تفاعلك...' },
    { id: 'experience', label: 'وش خبراتك؟', placeholder: 'اذكر خبراتك المتعلقة بالإدارة...' }
];

client.once('ready', () => {
    console.log(`✅ البوت شغال: ${client.user.tag}`);
    client.user.setActivity('تقديمات الإدارة', { type: 0 });
});

client.on('interactionCreate', async (interaction) => {
    const config = loadConfig();

    // Slash commands
    if (interaction.isChatInputCommand()) {
        await handleCommands(interaction, config);
        return;
    }

    // Select menu - section selection
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_section') {
        const section = interaction.values[0];
        await showApplicationModal(interaction, section);
        return;
    }

    // Modal submit - application form
    if (interaction.isModalSubmit() && interaction.customId.startsWith('apply_modal_')) {
        const section = interaction.customId.replace('apply_modal_', '');
        await handleApplicationSubmit(interaction, section, config);
        return;
    }

    // Buttons - accept/reject
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('accept_') || interaction.customId.startsWith('reject_')) {
            await handleAdminDecision(interaction, config);
        }
    }
});

async function handleCommands(interaction, config) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ هذا الأمر للأدمن فقط.', ephemeral: true });
    }

    const { commandName } = interaction;

    if (commandName === 'setup-apply') {
        // Post application embed in current channel
        const embed = new EmbedBuilder()
            .setTitle('📋 تقديم لفريق الإدارة')
            .setDescription('مرحباً بك في نظام التقديم لفريق الإدارة!\n\nاختر القسم الذي تريد التقديم فيه من القائمة أدناه، ثم أجب على الأسئلة.')
            .setColor(0x5865F2)
            .addFields(
                { name: '🎉 قسم الإيفنتات', value: 'مسؤول عن تنظيم وإدارة الفعاليات', inline: true },
                { name: '🛡️ قسم الدعم', value: 'مسؤول عن مساعدة الأعضاء وحل مشاكلهم', inline: true },
                { name: '🎮 قسم الألعاب', value: 'مسؤول عن تنظيم مسابقات وأنشطة الألعاب', inline: true }
            )
            .setFooter({ text: 'تأكد من قراءة شروط الإدارة قبل التقديم' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_section')
                .setPlaceholder('اختر القسم الذي تريد التقديم فيه...')
                .addOptions([
                    { label: 'قسم الإيفنتات', description: 'تنظيم وإدارة الفعاليات', value: 'event', emoji: '🎉' },
                    { label: 'قسم الدعم', description: 'مساعدة الأعضاء وحل مشاكلهم', value: 'support', emoji: '🛡️' },
                    { label: 'قسم الألعاب', description: 'تنظيم مسابقات وأنشطة الألعاب', value: 'games', emoji: '🎮' }
                ])
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        
        const newConfig = { ...config, applicationChannelId: interaction.channelId, guildId: interaction.guildId };
        saveConfig(newConfig);
        
        await interaction.reply({ content: '✅ تم إنشاء روم التقديم في هذه القناة!', ephemeral: true });
    }

    else if (commandName === 'setup-admin') {
        const newConfig = { ...config, adminChannelId: interaction.channelId, guildId: interaction.guildId };
        saveConfig(newConfig);
        await interaction.reply({ content: `✅ تم تعيين هذه القناة كروم الأدمن! جميع التقديمات ستُعرض هنا.`, ephemeral: true });
    }

    else if (commandName === 'setup-role') {
        const role = interaction.options.getRole('role');
        const newConfig = { ...config, staffRoleId: role.id, guildId: interaction.guildId };
        saveConfig(newConfig);
        await interaction.reply({ content: `✅ تم تعيين رتبة الإداري: **${role.name}**`, ephemeral: true });
    }

    else if (commandName === 'status') {
        const embed = new EmbedBuilder()
            .setTitle('⚙️ إعدادات البوت الحالية')
            .setColor(0x57F287)
            .addFields(
                { name: 'روم التقديم', value: config.applicationChannelId ? `<#${config.applicationChannelId}>` : '❌ غير مُعيَّن', inline: true },
                { name: 'روم الأدمن', value: config.adminChannelId ? `<#${config.adminChannelId}>` : '❌ غير مُعيَّن', inline: true },
                { name: 'رتبة الإداري', value: config.staffRoleId ? `<@&${config.staffRoleId}>` : '❌ غير مُعيَّنة', inline: true }
            )
            .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

async function showApplicationModal(interaction, section) {
    const modal = new ModalBuilder()
        .setCustomId(`apply_modal_${section}`)
        .setTitle(`التقديم لـ ${SECTIONS[section]}`);

    const inputs = QUESTIONS.map(q =>
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId(q.id)
                .setLabel(q.label)
                .setPlaceholder(q.placeholder)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(500)
        )
    );

    modal.addComponents(...inputs);
    await interaction.showModal(modal);
}

async function handleApplicationSubmit(interaction, section, config) {
    await interaction.deferReply({ ephemeral: true });

    const answers = QUESTIONS.map(q => ({
        question: q.label,
        answer: interaction.fields.getTextInputValue(q.id)
    }));

    const applicant = interaction.user;

    // Send to admin channel
    if (config.adminChannelId) {
        const adminChannel = await client.channels.fetch(config.adminChannelId).catch(() => null);
        if (adminChannel) {
            const embed = new EmbedBuilder()
                .setTitle(`📬 تقديم جديد - ${SECTIONS[section]}`)
                .setColor(0xFEE75C)
                .setThumbnail(applicant.displayAvatarURL())
                .addFields(
                    { name: '👤 المتقدم', value: `${applicant.tag} (${applicant.id})`, inline: true },
                    { name: '📂 القسم', value: SECTIONS[section], inline: true },
                    { name: '📅 التاريخ', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    ...answers.map(a => ({ name: `❓ ${a.question}`, value: a.answer, inline: false }))
                )
                .setFooter({ text: `معرف المتقدم: ${applicant.id}` })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_${applicant.id}_${section}`)
                    .setLabel('✅ قبول')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`reject_${applicant.id}_${section}`)
                    .setLabel('❌ رفض')
                    .setStyle(ButtonStyle.Danger)
            );

            await adminChannel.send({ embeds: [embed], components: [row] });
        }
    }

    await interaction.editReply({
        content: `✅ **تم إرسال تقديمك بنجاح!**\n\nتقدمت لـ **${SECTIONS[section]}**\nسيتم مراجعة تقديمك من قبل الإدارة وستصلك إجابة قريباً عبر الرسائل الخاصة.`
    });
}

async function handleAdminDecision(interaction, config) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ هذا الزر للأدمن فقط.', ephemeral: true });
    }

    const parts = interaction.customId.split('_');
    const action = parts[0];
    const userId = parts[1];
    const section = parts[2];

    await interaction.deferUpdate();

    const guild = interaction.guild;
    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member) {
        const failEmbed = new EmbedBuilder()
            .setColor(0xED4245)
            .setDescription('❌ لم يتم العثور على العضو، ربما غادر السيرفر.');
        return interaction.editReply({ embeds: [interaction.message.embeds[0], failEmbed], components: [] });
    }

    const serverName = guild.name;

    if (action === 'accept') {
        // Give role
        if (config.staffRoleId) {
            await member.roles.add(config.staffRoleId).catch(console.error);
        }

        // DM the user
        const dmEmbed = new EmbedBuilder()
            .setTitle('🎉 تم قبولك في فريق الإدارة!')
            .setColor(0x57F287)
            .setDescription(`تهانينا! تم قبولك كإداري في **${serverName}** في قسم **${SECTIONS[section]}**.\n\n📌 **الرجاء التوجه لقوانين الإدارة وقراءتها كاملاً.**\n\nنتمنى لك تجربة رائعة مع الفريق! 💪`)
            .setTimestamp();

        await member.send({ embeds: [dmEmbed] }).catch(() => {});

        // Update admin embed
        const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setColor(0x57F287)
            .setFooter({ text: `✅ تم القبول بواسطة ${interaction.user.tag}` });

        await interaction.message.edit({ embeds: [updatedEmbed], components: [] });

    } else if (action === 'reject') {
        // DM the user
        const dmEmbed = new EmbedBuilder()
            .setTitle('❌ نتائج تقديمك لفريق الإدارة')
            .setColor(0xED4245)
            .setDescription(`للأسف، تم رفض تقديمك كإداري في **${serverName}** في قسم **${SECTIONS[section]}**.\n\nشكراً لاهتمامك بالانضمام لفريقنا. يمكنك المحاولة مرة أخرى لاحقاً. 🙏`)
            .setTimestamp();

        await member.send({ embeds: [dmEmbed] }).catch(() => {});

        // Update admin embed
        const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setColor(0xED4245)
            .setFooter({ text: `❌ تم الرفض بواسطة ${interaction.user.tag}` });

        await interaction.message.edit({ embeds: [updatedEmbed], components: [] });
    }
}

client.login(process.env.DISCORD_TOKEN);
