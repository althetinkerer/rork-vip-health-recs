import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, LogOut, User, MapPin, CalendarDays, KeyRound, Bell } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { useData } from '@/context/DataContext';

export default function ProfileScreen() {
  const { healthHistories, gamificationProfile, uploadAvatar, logout } = useData();
  const [uploading, setUploading] = useState(false);

  // Fallback data mapping
  const info = healthHistories?.[0]?.patientInfo;
  const firstName = info?.firstName || 'Valued';
  const lastName = info?.lastName || 'Patient';
  const dob = info?.dateOfBirth || '--';

  const avatarUri = gamificationProfile?.avatar_url || 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/62ucvr22l2ze5sr60nnf9';

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to update your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);
        const { uri } = result.assets[0];
        
        // simple extension derivation
        const extMatch = uri.match(/\.(\w+)$/);
        const ext = extMatch ? extMatch[1] : 'jpeg';
        
        await uploadAvatar({ imageUri: uri, ext, base64: result.assets[0].base64 || '' });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Upload Failed', 'There was an issue saving your profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to log out cleanly.');
    }
  };

  return (
    <View style={s.screen}>
      <SafeAreaView edges={['top']} style={s.safeTop}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Profile</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={s.avatarContainer}>
          <View style={s.avatarWrapper}>
            <Image 
              source={avatarUri} 
              style={s.avatarImage} 
              contentFit="cover"
              transition={200}
            />
            {uploading ? (
              <View style={s.avatarOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : (
              <Pressable style={s.cameraBtn} onPress={handlePickImage} disabled={uploading}>
                <Camera size={16} color="#fff" />
              </Pressable>
            )}
          </View>
          <Text style={s.nameText}>{firstName} {lastName}</Text>
          <Text style={s.pointsText}>{gamificationProfile?.total_points || 0} Points • Level {gamificationProfile?.current_level || 1}</Text>
        </View>

        {/* Personal Details */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Personal Details</Text>
          <View style={s.card}>
            <View style={s.row}>
              <View style={s.iconBox}>
                <User size={20} color={colors.primary} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.rowLabel}>Full Name</Text>
                <Text style={s.rowValue}>{firstName} {lastName}</Text>
              </View>
            </View>
            <View style={s.divider} />
            <View style={s.row}>
              <View style={s.iconBox}>
                <CalendarDays size={20} color={colors.primary} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.rowLabel}>Date of Birth</Text>
                <Text style={s.rowValue}>{dob}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Settings */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Preferences</Text>
          <View style={s.card}>
            <Pressable style={s.rowAction}>
              <View style={s.iconBox}>
                <Bell size={20} color={colors.primary} />
              </View>
              <Text style={s.rowActionText}>Push Notifications</Text>
            </Pressable>
            <View style={s.divider} />
            <Pressable style={s.rowAction}>
              <View style={s.iconBox}>
                <KeyRound size={20} color={colors.primary} />
              </View>
              <Text style={s.rowActionText}>Security & FaceID</Text>
            </Pressable>
          </View>
        </View>

        {/* Account Actions */}
        <View style={s.section}>
          <Pressable style={s.logoutBtn} onPress={handleLogout}>
            <LogOut size={20} color={colors.error} />
            <Text style={s.logoutText}>Sign Out</Text>
          </Pressable>
        </View>

        <Text style={s.appVersion}>VIP Health Recs v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeTop: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.borderLight,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  nameText: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  pointsText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    ...shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  rowValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  rowActionText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 56, // aligns with text after icon
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  logoutText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.error,
  },
  appVersion: {
    textAlign: 'center',
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xl,
  },
});
