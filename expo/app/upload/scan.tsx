import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ScanLine, FileText, UploadCloud } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';

export default function ScanRecordsScreen() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('Initializing AI Core...');

  const processScan = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('We need camera permissions to scan documents!');
        return;
      }

      // Launch standard camera. (For a production multi-page scanner, expo-document-picker or a custom camera view is used. For this interactive layout, this is perfect.)
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled) {
        runMockAnalyis('standard');
      }
    } catch (e) {
      console.error(e);
      setAnalyzing(false);
    }
  };

  const processFileBrowser = async () => {
    // In our live production app, we would use the native DocumentPicker API here.
    // For this demonstration and to maintain Expo Go stability, we mock the filesystem selection:
    Alert.alert(
      'Browse Device Files',
      'Select a mock file to upload for processing:',
      [
        {
          text: 'Panoramic_Radiograph.dcm',
          onPress: () => runMockAnalyis('xray'),
        },
        {
          text: 'Periodontal_Chart.pdf',
          onPress: () => runMockAnalyis('standard'),
        },
        {
          text: 'Amoxicillin_Script.pdf',
          onPress: () => runMockAnalyis('prescription'),
        },
        {
          text: 'MetLife_Insurance_Card.jpg',
          onPress: () => runMockAnalyis('insurance'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const runMockAnalyis = async (type: 'standard' | 'xray' | 'prescription' | 'insurance') => {
    setAnalyzing(true);
    setAnalysisStep('Initiating Neural Net Engine...');
    await new Promise(r => setTimeout(r, 800));
    
    if (type === 'xray') {
      setAnalysisStep('Locating DICOM Encapsulation Header...');
      await new Promise(r => setTimeout(r, 1200));
      setAnalysisStep('Evaluating bone density gradients...');
      await new Promise(r => setTimeout(r, 1500));
    } else if (type === 'prescription') {
      setAnalysisStep('Scanning Pharmacy Barcodes...');
      await new Promise(r => setTimeout(r, 1200));
      setAnalysisStep('Validating SIG instructions...');
      await new Promise(r => setTimeout(r, 1500));
    } else if (type === 'insurance') {
      setAnalysisStep('OCR: Extracting Policy & Group Numbers...');
      await new Promise(r => setTimeout(r, 1500));
      setAnalysisStep('API Request: Pinging DentalXChange Aggregator...');
      await new Promise(r => setTimeout(r, 1500));
      setAnalysisStep('Real-Time Response: Securing Financial Structures...');
      await new Promise(r => setTimeout(r, 1000));
    } else {
      setAnalysisStep('Performing OCR on document...');
      await new Promise(r => setTimeout(r, 1200));
    }
    
    setAnalysisStep('Generating Cross-Disciplinary Insights...');
    await new Promise(r => setTimeout(r, 1500));
    
    // Push to insights with param flag
    router.push({ pathname: '/upload/insights', params: { insightType: type } });
  };

  if (analyzing) {
    return (
      <View style={[s.screen, s.centerDiv]}>
        <View style={s.radarBox}>
          <ScanLine size={64} color={colors.primary} />
        </View>
        <Text style={s.title}>AI Analysis Active</Text>
        <Text style={s.subtitle}>{analysisStep}</Text>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <View style={s.guidelineCard}>
        <View style={s.guidelineRow}>
          <FileText size={24} color={colors.primary} />
          <View style={s.guidelineTextWrap}>
            <Text style={s.guidelineTitle}>Document Guidelines</Text>
            <Text style={s.guidelineDesc}>Please place your paper records on a dark, well-lit surface. Ensure all text is legible and four corners are visible.</Text>
          </View>
        </View>
      </View>

      <View style={s.centerDiv}>
        <View style={s.illustrationWrapper}>
          <UploadCloud size={48} color={colors.primary} />
        </View>
        <Text style={s.title}>Ready to Upload</Text>
        <Text style={s.subtitle}>Snap a quick picture via the camera, or securely browse your device for professional format (.pdf, .dcm) exports!</Text>
      </View>

      <View style={{ gap: spacing.md, width: '100%' }}>
        <Pressable style={s.captureBtn} onPress={processScan}>
          <Camera size={24} color={colors.surface} />
          <Text style={s.captureBtnText}>Launch Camera</Text>
        </Pressable>
        
        <Pressable style={s.browseBtn} onPress={processFileBrowser}>
          <Text style={s.browseBtnText}>Browse Device Files</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  centerDiv: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelineCard: {
    backgroundColor: colors.primaryFaded,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: '#CBE0F5',
  },
  guidelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guidelineTextWrap: {
    flex: 1,
    marginLeft: spacing.md,
  },
  guidelineTitle: {
    ...typography.headline,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  guidelineDesc: {
    ...typography.callout,
    color: colors.primaryDark,
  },
  illustrationWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F1FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  radarBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F1FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadow.md,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  captureBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.md,
  },
  captureBtnText: {
    ...typography.headline,
    color: colors.textInverse,
  },
  browseBtn: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  browseBtnText: {
    ...typography.headline,
    color: colors.primaryDark,
  }
});
