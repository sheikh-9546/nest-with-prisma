import { PrismaClient, Status, SocialProvider } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
// Note: In seed files, we can use the enum values directly since this runs in Node.js context
// If you need to import the enums, you would need to adjust the import paths

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Roles
  console.log('📝 Creating roles...');
  const adminRole = await prisma.role.upsert({
    where: { roleName: 'admin' },
    update: {},
    create: {
      roleName: 'admin',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { roleName: 'user' },
    update: {},
    create: {
      roleName: 'user',
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { roleName: 'moderator' },
    update: {},
    create: {
      roleName: 'moderator',
    },
  });

  console.log(`✅ Created roles: Admin(${adminRole.id}), User(${userRole.id}), Moderator(${moderatorRole.id})`);

  // Create Admin User
  console.log('👤 Creating admin user...');
  const hashedAdminPassword = await bcrypt.hash('admin123', 10); // Using 10 salt rounds for seeding
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      countryCode: '+1',
      phoneNumber: '234567890',
      password: hashedAdminPassword,
      status: Status.ACTIVE,
      profilePic: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Admin',
      userRoles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });

  // Create Regular Users
  console.log('👥 Creating regular users...');
  const users = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      countryCode: '+1',
      phoneNumber: '234567891',
      profilePic: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=John',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      countryCode: '+1',
      phoneNumber: '234567892',
      profilePic: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Jane',
    },
    {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      countryCode: '+44',
      phoneNumber: '7700900123',
      profilePic: 'https://via.placeholder.com/150/FFFF00/000000?text=Bob',
    },
    {
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice.williams@example.com',
      countryCode: '+91',
      phoneNumber: '9876543210',
      profilePic: 'https://via.placeholder.com/150/FF00FF/FFFFFF?text=Alice',
    },
    {
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@example.com',
      countryCode: '+1',
      phoneNumber: '234567895',
      profilePic: 'https://via.placeholder.com/150/00FFFF/000000?text=Charlie',
    },
  ];

  const hashedUserPassword = await bcrypt.hash('Test@123', 10);
  const createdUsers = [];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedUserPassword,
        status: Status.ACTIVE,
        userRoles: {
          create: {
            roleId: userRole.id,
          },
        },
      },
    });
    createdUsers.push(user);
  }

  // Create a Moderator User
  console.log('🛡️ Creating moderator user...');
  const hashedModPassword = await bcrypt.hash('mod123', 10);
  const moderatorUser = await prisma.user.upsert({
    where: { email: 'moderator@example.com' },
    update: {},
    create: {
      firstName: 'Moderator',
      lastName: 'User',
      email: 'moderator@example.com',
      countryCode: '+1',
      phoneNumber: '234567896',
      password: hashedModPassword,
      status: Status.ACTIVE,
      profilePic: 'https://via.placeholder.com/150/800080/FFFFFF?text=Mod',
      userRoles: {
        create: {
          roleId: moderatorRole.id,
        },
      },
    },
  });

  // Create Social Login Users
  console.log('🔗 Creating users with social logins...');
  const socialUser1 = await prisma.user.upsert({
    where: { email: 'google.user@example.com' },
    update: {},
    create: {
      firstName: 'Google',
      lastName: 'User',
      email: 'google.user@example.com',
      countryCode: '+1',
      phoneNumber: '234567897',
      password: '', // No password for social login users
      status: Status.ACTIVE,
      profilePic: 'https://via.placeholder.com/150/4285F4/FFFFFF?text=Google',
      userRoles: {
        create: {
          roleId: userRole.id,
        },
      },
      socialLogins: {
        create: {
          provider: SocialProvider.GOOGLE,
          socialId: 'google_123456789',
          socialEmail: 'google.user@example.com',
          displayName: 'Google User',
          firstName: 'Google',
          lastName: 'User',
          avatarUrl: 'https://via.placeholder.com/150/4285F4/FFFFFF?text=Google',
          accessToken: 'fake_google_access_token',
          refreshToken: 'fake_google_refresh_token',
          tokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
          isVerified: true,
        },
      },
    },
  });

  const socialUser2 = await prisma.user.upsert({
    where: { email: 'facebook.user@example.com' },
    update: {},
    create: {
      firstName: 'Facebook',
      lastName: 'User',
      email: 'facebook.user@example.com',
      countryCode: '+1',
      phoneNumber: '234567898',
      password: '', // No password for social login users
      status: Status.ACTIVE,
      profilePic: 'https://via.placeholder.com/150/1877F2/FFFFFF?text=Facebook',
      userRoles: {
        create: {
          roleId: userRole.id,
        },
      },
      socialLogins: {
        create: {
          provider: SocialProvider.FACEBOOK,
          socialId: 'facebook_987654321',
          socialEmail: 'facebook.user@example.com',
          displayName: 'Facebook User',
          firstName: 'Facebook',
          lastName: 'User',
          avatarUrl: 'https://via.placeholder.com/150/1877F2/FFFFFF?text=Facebook',
          accessToken: 'fake_facebook_access_token',
          isVerified: true,
        },
      },
    },
  });

  // Create Settings
  console.log('⚙️ Creating application settings...');
  const settings = [
    {
      key: 'app_name',
      value: 'My NestJS App',
      description: 'Application name displayed in the UI',
    },
    {
      key: 'app_version',
      value: '1.0.0',
      description: 'Current application version',
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      description: 'Enable/disable maintenance mode',
    },
    {
      key: 'max_login_attempts',
      value: '5',
      description: 'Maximum login attempts before account lockout',
    },
    {
      key: 'session_timeout',
      value: '3600',
      description: 'Session timeout in seconds',
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting,
    });
  }

  // Create Audit Logs
  console.log('📊 Creating sample audit logs...');
  const auditLogs = [
    {
      userId: adminUser.id,
      action: 'CREATE',
      model: 'User',
      modelId: createdUsers[0].id.toString(),
      changes: { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', countryCode: '+1', phoneNumber: '234567891' },
      metadata: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' },
    },
    {
      userId: adminUser.id,
      action: 'UPDATE',
      model: 'User',
      modelId: createdUsers[1].id.toString(),
      changes: { status: 'ACTIVE' },
      metadata: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' },
    },
    {
      userId: moderatorUser.id,
      action: 'DELETE',
      model: 'Setting',
      modelId: '999',
      changes: { key: 'old_setting', value: 'old_value' },
      metadata: { ip: '192.168.1.2', userAgent: 'Chrome/91.0' },
    },
  ];

  for (const audit of auditLogs) {
    await prisma.audit.create({
      data: audit,
    });
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   • Roles: 3 (admin, user, moderator)`);
  console.log(`   • Users: ${users.length + 4} (including admin, moderator, and social users)`);
  console.log(`   • Settings: ${settings.length}`);
  console.log(`   • Audit Logs: ${auditLogs.length}`);
  console.log(`   • Social Logins: 2 (Google, Facebook)`);
  
  console.log('\n🔐 Test Credentials:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Moderator: moderator@example.com / mod123');
  console.log('   Users: john.doe@example.com / user123 (and others)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
