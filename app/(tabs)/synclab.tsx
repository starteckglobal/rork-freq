import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  Dimensions
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Zap, 
  BarChart,
  TrendingUp,
  Users, 
  Globe,
  Calendar,
  Download,
  Share2,
  Heart,
  Play,
  Clock,
  Filter,
  ChevronDown,
  ChevronLeft,
  Music,
  Headphones,
  DollarSign,
  FileText,
  MessageSquare,
  CreditCard,
  PlusCircle,
  Settings,
  ChevronRight,
  Lock,
  Check,
  Star,
  Award,
  Shield,
  Sparkles,
  Crown,
  ArrowLeft,
  Layers,
  Folder,
  Upload,
  Search,
  Send,
  Briefcase,
  FileCheck,
  FilePlus,
  Inbox,
  Bell,
  Bookmark,
  Paperclip,
  Percent,
  PieChart,
  Sliders,
  Tag,
  Target,
  Trash,
  UserCheck,
  Video,
  Wallet,
  XCircle,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Info,
  Circle
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { LinearGradient } from 'expo-linear-gradient';
import { tracks } from '@/mocks/tracks';
import { usePlayerStore } from '@/store/player-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SignupPaymentModal from '@/components/SignupPaymentModal';

const { width } = Dimensions.get('window');

// Define subscription plan types
type SubscriptionPlanId = 'monthly' | 'yearly' | 'premium';

// Define subscription plans
const subscriptionPlans = [
  {
    id: 'monthly' as SubscriptionPlanId,
    name: 'Monthly Plan',
    price: '$9.99',
    period: 'per month',
    features: [
      'Access to SyncLab tools',
      'Basic audio analysis',
      'Standard quality exports',
      'Limited cloud storage',
      'Email support'
    ],
    popular: false
  },
  {
    id: 'yearly' as SubscriptionPlanId,
    name: 'Yearly Plan',
    price: '$100',
    period: 'per year',
    features: [
      'Everything in Monthly Plan',
      'Advanced audio analysis',
      'High quality exports',
      'Increased cloud storage',
      'Priority email support',
      'Access to exclusive content'
    ],
    popular: true
  },
  {
    id: 'premium' as SubscriptionPlanId,
    name: 'Premium Yearly',
    price: '$500',
    period: 'per year',
    features: [
      'Everything in Yearly Plan',
      'Professional audio analysis',
      'Lossless quality exports',
      'Unlimited cloud storage',
      'Priority 24/7 support',
      'Early access to new features',
      'Personalized consultation',
      'Commercial usage rights'
    ],
    popular: false
  }
];

// Define SyncLab tools
const syncLabTools = [
  {
    id: 'mixer',
    name: 'AI Mixer',
    description: 'Automatically mix your tracks with AI technology',
    icon: 'sliders',
    comingSoon: false
  },
  {
    id: 'mastering',
    name: 'Mastering Suite',
    description: 'Professional mastering tools for perfect sound',
    icon: 'waveform',
    comingSoon: false
  },
  {
    id: 'spatial',
    name: 'Spatial Audio',
    description: 'Create immersive 3D audio experiences',
    icon: 'headphones',
    comingSoon: false
  },
  {
    id: 'collaboration',
    name: 'Real-time Collaboration',
    description: 'Work with other producers in real-time',
    icon: 'users',
    comingSoon: true
  },
  {
    id: 'stems',
    name: 'Stem Separator',
    description: 'Extract vocals, drums, bass and more from any track',
    icon: 'layers',
    comingSoon: false
  }
];

// Define SyncUP dashboard modules
const syncUpModules = [
  {
    id: 'royalties',
    name: 'Royalties Tracker',
    description: 'Track your earnings across platforms',
    icon: 'chart',
    available: true
  },
  {
    id: 'contacts',
    name: 'Contact Management',
    description: 'Organize industry contacts and messages',
    icon: 'users',
    available: true
  },
  {
    id: 'documents',
    name: 'Document Management',
    description: 'Store and manage contracts and legal documents',
    icon: 'file',
    available: true
  },
  {
    id: 'earnings',
    name: 'Earnings Management',
    description: 'Track payments and financial information',
    icon: 'money',
    available: true
  },
  {
    id: 'donations',
    name: 'Donation System',
    description: 'Receive and manage fan donations',
    icon: 'heart',
    available: true
  },
  {
    id: 'syncit',
    name: 'SYNCit Integration',
    description: 'License your music for sync opportunities',
    icon: 'sync',
    available: true
  }
];

// Mock data for royalties
const royaltiesData = [
  { month: 'Jan', amount: 1200 },
  { month: 'Feb', amount: 1500 },
  { month: 'Mar', amount: 1800 },
  { month: 'Apr', amount: 1300 },
  { month: 'May', amount: 2200 },
  { month: 'Jun', amount: 2500 }
];

// Mock data for contacts
const contactsData = [
  { id: 'c1', name: 'Sony Music', type: 'Label', lastContact: '2 days ago' },
  { id: 'c2', name: 'Universal Publishing', type: 'Publisher', lastContact: '1 week ago' },
  { id: 'c3', name: 'Jane Smith', type: 'A&R', lastContact: 'Yesterday' },
  { id: 'c4', name: 'Sync Agency', type: 'Licensing', lastContact: '3 days ago' }
];

// Mock data for documents
const documentsData = [
  { id: 'd1', name: 'Distribution Agreement.pdf', date: '2023-05-15', size: '2.4 MB' },
  { id: 'd2', name: 'Publishing Contract.pdf', date: '2023-06-22', size: '3.1 MB' },
  { id: 'd3', name: 'Collaboration Agreement.docx', date: '2023-07-10', size: '1.8 MB' },
  { id: 'd4', name: 'Royalty Statement Q2.pdf', date: '2023-07-15', size: '4.2 MB' }
];

// Mock data for earnings
const earningsData = {
  total: '$12,450.75',
  pending: '$2,350.00',
  lastPayment: {
    amount: '$1,245.50',
    date: '2023-07-01',
    source: 'Spotify'
  },
  platforms: [
    { name: 'Spotify', percentage: 45 },
    { name: 'Apple Music', percentage: 30 },
    { name: 'YouTube', percentage: 15 },
    { name: 'Others', percentage: 10 }
  ]
};

// Mock data for donations
const donationsData = [
  { id: 'don1', name: 'Alex Johnson', amount: '$25.00', date: '2023-07-20', message: 'Love your music!' },
  { id: 'don2', name: 'Maria Garcia', amount: '$50.00', date: '2023-07-18', message: 'Your latest album is amazing!' },
  { id: 'don3', name: 'John Smith', amount: '$10.00', date: '2023-07-15', message: 'Keep up the great work!' },
  { id: 'don4', name: 'Sarah Williams', amount: '$100.00', date: '2023-07-10', message: 'Your music helped me through tough times' }
];

// Mock data for opportunities
const opportunitiesData = [
  {
    id: 'opp1',
    title: 'Film Soundtrack',
    company: 'Universal Pictures',
    deadline: '2023-08-15',
    compensation: '$5,000 - $10,000',
    description: 'Looking for electronic tracks for an upcoming sci-fi film. Need atmospheric, futuristic sounds.',
    status: 'open',
    requirements: 'Tracks must be original, between 2-4 minutes, and have no vocals.',
    genre: 'Electronic, Ambient, Sci-Fi',
    submissionProcess: 'Submit up to 3 tracks for consideration. Selected artists will be contacted for licensing details.'
  },
  {
    id: 'opp2',
    title: 'TV Commercial',
    company: 'Nike',
    deadline: '2023-08-10',
    compensation: '$3,000 - $7,000',
    description: 'Seeking upbeat, motivational tracks for a new athletic wear campaign.',
    status: 'open',
    requirements: 'Tracks should be energetic, positive, and build to a climax. 30-60 seconds in length.',
    genre: 'Pop, Electronic, Hip-Hop',
    submissionProcess: 'Submit 1-2 tracks. Final selection will be made by the brand creative team.'
  },
  {
    id: 'opp3',
    title: 'Mobile Game Soundtrack',
    company: 'Epic Games',
    deadline: '2023-09-01',
    compensation: '$2,000 - $5,000',
    description: 'Need a complete soundtrack for a new adventure mobile game. Multiple tracks required.',
    status: 'open',
    requirements: 'Looking for a cohesive set of tracks that can work together. Various moods needed.',
    genre: 'Orchestral, Electronic, Adventure',
    submissionProcess: 'Submit a demo reel of your work. Selected composers will be asked to create custom tracks.'
  },
  {
    id: 'opp4',
    title: 'Podcast Intro',
    company: 'Spotify Originals',
    deadline: '2023-08-05',
    compensation: '$1,000',
    description: 'Short intro music needed for a new technology podcast series.',
    status: 'open',
    requirements: 'Track should be 15-30 seconds, modern, tech-focused sound.',
    genre: 'Electronic, Minimal',
    submissionProcess: 'Submit your track as an MP3. Final selection will be made by the podcast host.'
  }
];

// Mock data for submitted tracks
const submittedTracksData = [
  {
    id: 'sub1',
    title: 'Midnight Dreams',
    opportunity: 'Film Soundtrack',
    submittedDate: '2023-07-15',
    status: 'Under Review',
    feedback: null
  },
  {
    id: 'sub2',
    title: 'Urban Motion',
    opportunity: 'TV Commercial',
    submittedDate: '2023-07-10',
    status: 'Selected for Shortlist',
    feedback: "Great energy, perfect fit for our campaign. We will be in touch soon."
  },
  {
    id: 'sub3',
    title: 'Digital Horizon',
    opportunity: 'Mobile Game Soundtrack',
    submittedDate: '2023-07-05',
    status: 'Not Selected',
    feedback: 'Good track, but we were looking for something with more orchestral elements.'
  }
];

// Mock data for catalog
const catalogData = tracks.slice(0, 6).map(track => ({
  id: track.id,
  title: track.title,
  duration: track.duration,
  genre: track.genre,
  releaseDate: track.releaseDate,
  status: Math.random() > 0.5 ? 'Available for Sync' : 'Not Available',
  syncHistory: Math.random() > 0.7 ? [
    {
      project: 'TV Commercial',
      company: 'Samsung',
      date: '2023-03-15',
      compensation: '$2,500'
    }
  ] : [],
  coverArt: track.coverArt
}));

export default function SyncLabScreen() {
  const router = useRouter();
  const { isLoggedIn, setShowLoginModal, currentUser, subscribeToPlan, hasFeatureAccess } = useUserStore();
  const { currentTrack, isMinimized } = usePlayerStore();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('yearly');
  const [loading, setLoading] = useState<boolean>(false);
  const [showSubscriptionSection, setShowSubscriptionSection] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState<boolean>(false);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [showSyncUp, setShowSyncUp] = useState<boolean>(false);
  const [activeSyncUpModule, setActiveSyncUpModule] = useState<string | null>(null);
  const [loadingModule, setLoadingModule] = useState<boolean>(false);
  const [showOpportunities, setShowOpportunities] = useState<boolean>(false);
  const [showSubmissions, setShowSubmissions] = useState<boolean>(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState<boolean>(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGenre, setFilterGenre] = useState<string>('All');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedSubmissionTracks, setSelectedSubmissionTracks] = useState<string[]>([]);
  const [submissionNote, setSubmissionNote] = useState<string>('');
  const [showSubmissionForm, setShowSubmissionForm] = useState<boolean>(false);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  
  // Check if user is subscribed
  const hasSubscription = currentUser?.subscription?.plan !== undefined;
  
  // Get subscription plan name if subscribed
  const subscriptionPlan = currentUser?.subscription?.plan || null;
  
  useEffect(() => {
    // If user is not logged in, we should show the subscription section
    if (!isLoggedIn) {
      setShowSubscriptionSection(true);
      setShowSyncUp(false);
      setShowOpportunities(false);
      setShowSubmissions(false);
      setShowCatalog(false);
    } else {
      // If user is logged in but not subscribed, show subscription section
      setShowSubscriptionSection(!hasSubscription);
      setShowSyncUp(false);
      setShowOpportunities(false);
      setShowSubmissions(false);
      setShowCatalog(false);
    }
  }, [isLoggedIn, hasSubscription]);
  
  const handleSubscribe = (planId: SubscriptionPlanId) => {
    if (!isLoggedIn) {
      // Show signup modal instead of login modal
      setSelectedPlan(planId);
      setShowSignupModal(true);
      return;
    }
    
    // If user is already logged in, proceed with subscription
    setSelectedPlan(planId);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      subscribeToPlan(planId);
      setLoading(false);
      setShowSubscriptionSection(false);
      
      Alert.alert(
        "Subscription Activated",
        `Your ${planId} subscription to SyncLab has been activated. Enjoy all the premium features!`,
        [{ text: "OK" }]
      );
    }, 1500);
  };
  
  const handleToolSelect = (toolId: string) => {
    if (hasSubscription) {
      setActiveToolId(toolId);
      
      // In a real app, this would navigate to the specific tool
      // For now, we'll just show an alert
      const tool = syncLabTools.find(t => t.id === toolId);
      
      if (tool?.comingSoon) {
        Alert.alert(
          "Coming Soon",
          `${tool.name} is coming soon! We're working hard to bring this feature to you.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          tool?.name || "Tool",
          `You're now using ${tool?.name}. This is a placeholder for the actual tool interface.`,
          [{ text: "OK" }]
        );
      }
    } else {
      setShowSubscriptionSection(true);
      Alert.alert(
        "Subscription Required",
        "You need to subscribe to SyncLab to access this tool.",
        [{ text: "OK" }]
      );
    }
  };
  
  const handleSyncUpToggle = () => {
    if (hasSubscription) {
      setShowSyncUp(!showSyncUp);
      setShowSubscriptionSection(false);
      setActiveSyncUpModule(null);
      setShowOpportunities(false);
      setShowSubmissions(false);
      setShowCatalog(false);
      setActiveTab('overview');
    } else {
      setShowSubscriptionSection(true);
      Alert.alert(
        "Subscription Required",
        "You need to subscribe to SyncLab to access SyncUP features.",
        [{ text: "OK" }]
      );
    }
  };
  
  const handleOpportunitiesToggle = () => {
    if (hasSubscription) {
      setShowOpportunities(!showOpportunities);
      setShowSubscriptionSection(false);
      setShowSyncUp(false);
      setShowSubmissions(false);
      setShowCatalog(false);
      setActiveTab('overview');
    } else {
      setShowSubscriptionSection(true);
      Alert.alert(
        "Subscription Required",
        "You need to subscribe to SyncLab to access Opportunities features.",
        [{ text: "OK" }]
      );
    }
  };
  
  const handleSubmissionsToggle = () => {
    if (hasSubscription) {
      setShowSubmissions(!showSubmissions);
      setShowSubscriptionSection(false);
      setShowSyncUp(false);
      setShowOpportunities(false);
      setShowCatalog(false);
      setActiveTab('overview');
    } else {
      setShowSubscriptionSection(true);
      Alert.alert(
        "Subscription Required",
        "You need to subscribe to SyncLab to access Submissions features.",
        [{ text: "OK" }]
      );
    }
  };
  
  const handleCatalogToggle = () => {
    if (hasSubscription) {
      setShowCatalog(!showCatalog);
      setShowSubscriptionSection(false);
      setShowSyncUp(false);
      setShowOpportunities(false);
      setShowSubmissions(false);
      setActiveTab('overview');
    } else {
      setShowSubscriptionSection(true);
      Alert.alert(
        "Subscription Required",
        "You need to subscribe to SyncLab to access Catalog features.",
        [{ text: "OK" }]
      );
    }
  };
  
  const handleSyncUpModuleSelect = (moduleId: string) => {
    setLoadingModule(true);
    setActiveSyncUpModule(moduleId);
    
    // Simulate loading data
    setTimeout(() => {
      setLoadingModule(false);
    }, 1000);
  };
  
  const handleExportData = (format: string) => {
    setLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Export Successful",
        `Your data has been exported as ${format.toUpperCase()}. Check your downloads folder.`,
        [{ text: "OK" }]
      );
    }, 1500);
  };
  
  const handleAddContact = () => {
    Alert.alert(
      "Add Contact",
      "This feature will allow you to add new industry contacts.",
      [{ text: "OK" }]
    );
  };
  
  const handleUploadDocument = () => {
    Alert.alert(
      "Upload Document",
      "This feature will allow you to upload contracts and legal documents.",
      [{ text: "OK" }]
    );
  };
  
  const handleWithdraw = () => {
    Alert.alert(
      "Withdraw Funds",
      "This feature will allow you to withdraw your earnings to your connected payment method.",
      [{ text: "OK" }]
    );
  };
  
  const handleConnectPayment = (method: string) => {
    Alert.alert(
      `Connect ${method}`,
      `This feature will allow you to connect your ${method} account for withdrawals.`,
      [{ text: "OK" }]
    );
  };
  
  const handleThankDonor = (donorName: string) => {
    Alert.alert(
      "Thank Donor",
      `Send a thank you message to ${donorName}.`,
      [{ text: "OK" }]
    );
  };
  
  const handleSyncItSetup = () => {
    Alert.alert(
      "SYNCit Setup",
      "Configure your licensing options and make your music available for sync opportunities.",
      [{ text: "OK" }]
    );
  };
  
  const handleApplyToOpportunity = (opportunityId: string) => {
    setSelectedOpportunity(opportunityId);
    setShowSubmissionForm(true);
  };
  
  const handleSubmitTracks = () => {
    if (selectedSubmissionTracks.length === 0) {
      Alert.alert(
        "No Tracks Selected",
        "Please select at least one track to submit.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setLoading(true);
    
    // Simulate submission process
    setTimeout(() => {
      setLoading(false);
      setShowSubmissionForm(false);
      setSelectedSubmissionTracks([]);
      setSubmissionNote('');
      
      Alert.alert(
        "Submission Successful",
        "Your tracks have been submitted for consideration. You can track the status in the Submissions tab.",
        [{ text: "OK" }]
      );
    }, 1500);
  };
  
  const handleToggleTrackSelection = (trackId: string) => {
    if (selectedSubmissionTracks && selectedSubmissionTracks.includes(trackId)) {
      setSelectedSubmissionTracks(selectedSubmissionTracks.filter(id => id !== trackId));
    } else if (selectedSubmissionTracks) {
      setSelectedSubmissionTracks([...selectedSubmissionTracks, trackId]);
    } else {
      setSelectedSubmissionTracks([trackId]);
    }
  };
  
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    setShowTimeRangeDropdown(false);
    
    // Simulate loading when changing time range
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };
  
  const handleTrackStatusToggle = (trackId: string) => {
    // In a real app, this would update the track's sync availability status
    Alert.alert(
      "Update Track Status",
      "This would toggle the track's availability for sync opportunities.",
      [{ text: "OK" }]
    );
  };
  
  const handleTrackDetails = (trackId: string) => {
    setSelectedTrack(trackId);
    
    // In a real app, this would navigate to a detailed view of the track
    Alert.alert(
      "Track Details",
      "This would show detailed information about the track and its sync history.",
      [{ text: "OK" }]
    );
  };
  
  // Calculate content padding based on player state
  const getContentPaddingBottom = () => {
    const baseTabBarHeight = Platform.OS === 'ios' ? 80 + insets.bottom : 70;
    const miniPlayerHeight = 60;
    
    if (currentTrack && isMinimized) {
      return baseTabBarHeight + miniPlayerHeight;
    } else if (currentTrack && !isMinimized) {
      return 20; // Full player covers everything
    } else {
      return baseTabBarHeight;
    }
  };
  
  const renderSubscriptionSection = () => (
    <>
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Zap size={40} color={colors.primary} />
        </View>
        <Text style={styles.heroTitle}>SyncLab</Text>
        <Text style={styles.heroSubtitle}>Advanced audio tools for creators</Text>
        
        <View style={styles.featureHighlights}>
          <View style={styles.featureItem}>
            <Music size={20} color={colors.primary} />
            <Text style={styles.featureText}>AI-powered mixing</Text>
          </View>
          <View style={styles.featureItem}>
            <Headphones size={20} color={colors.primary} />
            <Text style={styles.featureText}>Spatial audio</Text>
          </View>
          <View style={styles.featureItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.featureText}>Real-time collaboration</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.plansContainer}>
        <Text style={styles.plansTitle}>Choose Your Plan</Text>
        <Text style={styles.plansSubtitle}>Unlock the full potential of your music</Text>
        
        {subscriptionPlans.map(plan => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.selectedPlan,
              plan.popular && styles.popularPlan
            ]}
            onPress={() => setSelectedPlan(plan.id)}
            disabled={loading}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Star size={12} color="#FFF" />
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planPeriod}>{plan.period}</Text>
            </View>
            
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Check size={16} color={colors.primary} />
                  <Text style={styles.featureDescription}>{feature}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity
              style={[
                styles.subscribeButton,
                selectedPlan === plan.id && styles.selectedSubscribeButton,
                loading && styles.disabledButton
              ]}
              onPress={() => handleSubscribe(plan.id)}
              disabled={loading}
            >
              {loading && selectedPlan === plan.id ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.subscribeButtonText}>
                  {selectedPlan === plan.id ? 'Subscribe' : 'Select'}
                </Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsSectionTitle}>Why Choose SyncLab?</Text>
        
        <View style={styles.benefitCard}>
          <Award size={24} color={colors.primary} />
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Professional Quality</Text>
            <Text style={styles.benefitDescription}>
              Industry-standard tools used by top producers and artists worldwide
            </Text>
          </View>
        </View>
        
        <View style={styles.benefitCard}>
          <Shield size={24} color={colors.primary} />
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Secure Collaboration</Text>
            <Text style={styles.benefitDescription}>
              End-to-end encrypted file sharing and real-time collaboration
            </Text>
          </View>
        </View>
        
        <View style={styles.benefitCard}>
          <Sparkles size={24} color={colors.primary} />
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>AI-Powered Features</Text>
            <Text style={styles.benefitDescription}>
              Advanced algorithms to enhance your creative workflow
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.testimonialSection}>
        <Text style={styles.testimonialTitle}>What Our Users Say</Text>
        
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>
            "SyncLab has completely transformed my production workflow. The AI-powered mixing tools save me hours of work!"
          </Text>
          <View style={styles.testimonialAuthor}>
            <Text style={styles.authorName}>Alex Johnson</Text>
            <Text style={styles.authorTitle}>Producer, Platinum Records</Text>
          </View>
        </View>
        
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>
            "The spatial audio features in SyncLab are unmatched. My tracks have never sounded this immersive before."
          </Text>
          <View style={styles.testimonialAuthor}>
            <Text style={styles.authorName}>Maria Rodriguez</Text>
            <Text style={styles.authorTitle}>Sound Designer</Text>
          </View>
        </View>
      </View>
    </>
  );
  
  const renderDashboard = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SyncLab Dashboard</Text>
        
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity 
            style={styles.timeRangeButton}
            onPress={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
          >
            <Text style={styles.timeRangeText}>
              {timeRange === '7d' ? 'Last 7 days' : 
               timeRange === '30d' ? 'Last 30 days' : 
               timeRange === '90d' ? 'Last 90 days' : 'All time'}
            </Text>
            <ChevronDown size={16} color={colors.text} />
          </TouchableOpacity>
          
          {showTimeRangeDropdown && (
            <View style={styles.timeRangeDropdown}>
              <TouchableOpacity 
                style={styles.timeRangeOption}
                onPress={() => handleTimeRangeChange('7d')}
              >
                <Text style={[
                  styles.timeRangeOptionText,
                  timeRange === '7d' && styles.timeRangeOptionTextActive
                ]}>Last 7 days</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.timeRangeOption}
                onPress={() => handleTimeRangeChange('30d')}
              >
                <Text style={[
                  styles.timeRangeOptionText,
                  timeRange === '30d' && styles.timeRangeOptionTextActive
                ]}>Last 30 days</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.timeRangeOption}
                onPress={() => handleTimeRangeChange('90d')}
              >
                <Text style={[
                  styles.timeRangeOptionText,
                  timeRange === '90d' && styles.timeRangeOptionTextActive
                ]}>Last 90 days</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.timeRangeOption}
                onPress={() => handleTimeRangeChange('all')}
              >
                <Text style={[
                  styles.timeRangeOptionText,
                  timeRange === 'all' && styles.timeRangeOptionTextActive
                ]}>All time</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.subscriptionInfo}>
        <Crown size={24} color={colors.primary} />
        <View style={styles.subscriptionTextContainer}>
          <Text style={styles.subscriptionTitle}>
            {subscriptionPlan ? `${subscriptionPlan.charAt(0).toUpperCase()}${subscriptionPlan.slice(1)} Plan` : 'Active Plan'}
          </Text>
          <Text style={styles.subscriptionSubtitle}>
            Your subscription is active
          </Text>
        </View>
      </View>
      
      <View style={styles.tabs}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          removeClippedSubviews={Platform.OS === 'android'}
        >
          <TouchableOpacity 
            style={[styles.tab, !showSyncUp && !showOpportunities && !showSubmissions && !showCatalog && styles.activeTab]}
            onPress={() => {
              setShowSyncUp(false);
              setShowOpportunities(false);
              setShowSubmissions(false);
              setShowCatalog(false);
              setActiveTab('overview');
            }}
          >
            <BarChart size={16} color={!showSyncUp && !showOpportunities && !showSubmissions && !showCatalog ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, !showSyncUp && !showOpportunities && !showSubmissions && !showCatalog && styles.activeTabText]}>Tools</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, showSyncUp && styles.activeTab]}
            onPress={handleSyncUpToggle}
          >
            <Zap size={16} color={showSyncUp ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, showSyncUp && styles.activeTabText]}>SyncUP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, showOpportunities && styles.activeTab]}
            onPress={handleOpportunitiesToggle}
          >
            <Star size={16} color={showOpportunities ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, showOpportunities && styles.activeTabText]}>Opportunities</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, showSubmissions && styles.activeTab]}
            onPress={handleSubmissionsToggle}
          >
            <Inbox size={16} color={showSubmissions ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, showSubmissions && styles.activeTabText]}>Submissions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, showCatalog && styles.activeTab]}
            onPress={handleCatalogToggle}
          >
            <Music size={16} color={showCatalog ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, showCatalog && styles.activeTabText]}>Catalog</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {!showSyncUp && !showOpportunities && !showSubmissions && !showCatalog ? (
        <View style={styles.toolsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Available Tools</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Recent Projects</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Opportunities</Text>
              <View style={styles.statTrend}>
                <TrendingUp size={12} color="#4CAF50" />
                <Text style={styles.statTrendText}>+3 new</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>$1,245</Text>
              <Text style={styles.statLabel}>Earnings</Text>
              <View style={styles.statTrend}>
                <TrendingUp size={12} color="#4CAF50" />
                <Text style={styles.statTrendText}>+8%</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Your SyncLab Tools</Text>
          
          <View style={styles.toolsGrid}>
            {syncLabTools.map(tool => (
              <TouchableOpacity
                key={tool.id}
                style={[
                  styles.toolCard,
                  activeToolId === tool.id && styles.activeToolCard,
                  tool.comingSoon && styles.comingSoonToolCard
                ]}
                onPress={() => handleToolSelect(tool.id)}
                disabled={tool.comingSoon}
              >
                {tool.comingSoon && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>COMING SOON</Text>
                  </View>
                )}
                
                <View style={styles.toolIconContainer}>
                  {/* Use appropriate icon based on tool.icon */}
                  {tool.icon === 'sliders' && <Sliders size={28} color={colors.primary} />}
                  {tool.icon === 'waveform' && <Zap size={28} color={colors.primary} />}
                  {tool.icon === 'headphones' && <Headphones size={28} color={colors.primary} />}
                  {tool.icon === 'users' && <Users size={28} color={colors.primary} />}
                  {tool.icon === 'layers' && <Layers size={28} color={colors.primary} />}
                </View>
                
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          
          <View style={styles.emptyProjectsState}>
            <Music size={40} color={colors.textSecondary} />
            <Text style={styles.emptyProjectsText}>
              You don't have any projects yet
            </Text>
            <Text style={styles.emptyProjectsSubtext}>
              Start using SyncLab tools to create your first project
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => Alert.alert("Help", "SyncLab support is available 24/7. Contact us at support@synclab.com")}
          >
            <Text style={styles.helpButtonText}>Need Help?</Text>
          </TouchableOpacity>
        </View>
      ) : showSyncUp ? (
        <View style={styles.syncUpContainer}>
          {activeSyncUpModule ? (
            <View style={styles.moduleDetailContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setActiveSyncUpModule(null)}
              >
                <ArrowLeft size={20} color={colors.text} />
                <Text style={styles.backButtonText}>Back to SyncUP</Text>
              </TouchableOpacity>
              
              {loadingModule ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading data...</Text>
                </View>
              ) : (
                <>
                  {activeSyncUpModule === 'royalties' && (
                    <View style={styles.moduleContent}>
                      <Text style={styles.moduleTitle}>Royalties Tracker</Text>
                      
                      <View style={styles.royaltiesChart}>
                        <Text style={styles.chartTitle}>Earnings Last 6 Months</Text>
                        <View style={styles.chartContainer}>
                          {Platform.OS === 'web' ? (
                            <View style={[styles.webChartPlaceholder, { height: 150 }]}>
                              <Text style={styles.webChartText}>Chart visualization available on mobile devices</Text>
                            </View>
                          ) : (
                            royaltiesData.map((data, index) => (
                              <View key={index} style={styles.chartBarContainer}>
                                <View 
                                  style={[
                                    styles.chartBar, 
                                    { height: (data.amount / 2500) * 150 }
                                  ]}
                                />
                                <Text style={styles.chartLabel}>{data.month}</Text>
                              </View>
                            ))
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.royaltiesSummary}>
                        <View style={styles.summaryItem}>
                          <Text style={styles.summaryLabel}>Total Earnings</Text>
                          <Text style={styles.summaryValue}>$10,500</Text>
                        </View>
                        <View style={styles.summaryItem}>
                          <Text style={styles.summaryLabel}>This Month</Text>
                          <Text style={styles.summaryValue}>$2,500</Text>
                        </View>
                        <View style={styles.summaryItem}>
                          <Text style={styles.summaryLabel}>Growth</Text>
                          <Text style={styles.summaryValue}>+13.5%</Text>
                        </View>
                      </View>
                      
                      <View style={styles.platformBreakdown}>
                        <Text style={styles.breakdownTitle}>Platform Breakdown</Text>
                        <View style={styles.platformItem}>
                          <Text style={styles.platformName}>Spotify</Text>
                          <View style={styles.platformBarContainer}>
                            <View style={[styles.platformBar, { width: '65%', backgroundColor: '#1DB954' }]} />
                          </View>
                          <Text style={styles.platformPercentage}>65%</Text>
                        </View>
                        <View style={styles.platformItem}>
                          <Text style={styles.platformName}>Apple Music</Text>
                          <View style={styles.platformBarContainer}>
                            <View style={[styles.platformBar, { width: '20%', backgroundColor: '#FC3C44' }]} />
                          </View>
                          <Text style={styles.platformPercentage}>20%</Text>
                        </View>
                        <View style={styles.platformItem}>
                          <Text style={styles.platformName}>YouTube</Text>
                          <View style={styles.platformBarContainer}>
                            <View style={[styles.platformBar, { width: '10%', backgroundColor: '#FF0000' }]} />
                          </View>
                          <Text style={styles.platformPercentage}>10%</Text>
                        </View>
                        <View style={styles.platformItem}>
                          <Text style={styles.platformName}>Others</Text>
                          <View style={styles.platformBarContainer}>
                            <View style={[styles.platformBar, { width: '5%', backgroundColor: '#808080' }]} />
                          </View>
                          <Text style={styles.platformPercentage}>5%</Text>
                        </View>
                      </View>
                      
                      <View style={styles.exportButtons}>
                        <TouchableOpacity 
                          style={styles.exportButton}
                          onPress={() => handleExportData('csv')}
                        >
                          <Download size={16} color={colors.text} />
                          <Text style={styles.exportButtonText}>Export CSV</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.exportButton}
                          onPress={() => handleExportData('pdf')}
                        >
                          <Download size={16} color={colors.text} />
                          <Text style={styles.exportButtonText}>Export PDF</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  
                  {activeSyncUpModule === 'contacts' && (
                    <View style={styles.moduleContent}>
                      <Text style={styles.moduleTitle}>Contact Management</Text>
                      
                      <View style={styles.searchContainer}>
                        <TextInput
                          style={styles.searchInput}
                          placeholder="Search contacts..."
                          placeholderTextColor={colors.textTertiary}
                        />
                      </View>
                      
                      <View style={styles.contactsList}>
                        {contactsData.map((contact) => (
                          <View key={contact.id} style={styles.contactItem}>
                            <View style={styles.contactAvatar}>
                              <Users size={24} color={colors.text} />
                            </View>
                            <View style={styles.contactInfo}>
                              <Text style={styles.contactName}>{contact.name}</Text>
                              <Text style={styles.contactType}>{contact.type}</Text>
                              <Text style={styles.contactLastContact}>Last contact: {contact.lastContact}</Text>
                            </View>
                            <TouchableOpacity style={styles.contactAction}>
                              <MessageSquare size={20} color={colors.primary} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={handleAddContact}
                      >
                        <PlusCircle size={20} color="#FFF" />
                        <Text style={styles.addButtonText}>Add New Contact</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {activeSyncUpModule === 'documents' && (
                    <View style={styles.moduleContent}>
                      <Text style={styles.moduleTitle}>Document Management</Text>
                      
                      <View style={styles.documentsHeader}>
                        <Text style={styles.documentsHeaderText}>Name</Text>
                        <Text style={styles.documentsHeaderText}>Date</Text>
                        <Text style={styles.documentsHeaderText}>Size</Text>
                      </View>
                      
                      <View style={styles.documentsList}>
                        {documentsData.map((document) => (
                          <View key={document.id} style={styles.documentItem}>
                            <View style={styles.documentIcon}>
                              <FileText size={24} color={colors.primary} />
                            </View>
                            <View style={styles.documentInfo}>
                              <Text style={styles.documentName}>{document.name}</Text>
                              <Text style={styles.documentDate}>{document.date}</Text>
                              <Text style={styles.documentSize}>{document.size}</Text>
                            </View>
                            <View style={styles.documentActions}>
                              <TouchableOpacity style={styles.documentAction}>
                                <Download size={18} color={colors.text} />
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.documentAction}>
                                <Share2 size={18} color={colors.text} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={handleUploadDocument}
                      >
                        <Upload size={20} color="#FFF" />
                        <Text style={styles.addButtonText}>Upload Document</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {activeSyncUpModule === 'earnings' && (
                    <View style={styles.moduleContent}>
                      <Text style={styles.moduleTitle}>Earnings Management</Text>
                      
                      <View style={styles.earningsSummary}>
                        <View style={styles.earningsCard}>
                          <Text style={styles.earningsLabel}>Total Earnings</Text>
                          <Text style={styles.earningsValue}>{earningsData.total}</Text>
                        </View>
                        <View style={styles.earningsCard}>
                          <Text style={styles.earningsLabel}>Pending</Text>
                          <Text style={styles.earningsValue}>{earningsData.pending}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.lastPaymentCard}>
                        <Text style={styles.lastPaymentTitle}>Last Payment</Text>
                        <Text style={styles.lastPaymentAmount}>{earningsData.lastPayment.amount}</Text>
                        <Text style={styles.lastPaymentDetails}>
                          {earningsData.lastPayment.date} • {earningsData.lastPayment.source}
                        </Text>
                      </View>
                      
                      <View style={styles.platformBreakdown}>
                        <Text style={styles.breakdownTitle}>Revenue by Platform</Text>
                        {earningsData.platforms.map((platform, index) => (
                          <View key={index} style={styles.platformItem}>
                            <Text style={styles.platformName}>{platform.name}</Text>
                            <View style={styles.platformBarContainer}>
                              <View 
                                style={[
                                  styles.platformBar, 
                                  { 
                                    width: `${platform.percentage}%`,
                                    backgroundColor: index === 0 ? '#1DB954' : 
                                                    index === 1 ? '#FC3C44' : 
                                                    index === 2 ? '#FF0000' : '#808080'
                                  }
                                ]} 
                              />
                            </View>
                            <Text style={styles.platformPercentage}>{platform.percentage}%</Text>
                          </View>
                        ))}
                      </View>
                      
                      <View style={styles.paymentMethods}>
                        <Text style={styles.paymentMethodsTitle}>Payment Methods</Text>
                        
                        <View style={styles.paymentMethodsList}>
                          <TouchableOpacity 
                            style={styles.paymentMethod}
                            onPress={() => handleConnectPayment('PayPal')}
                          >
                            <CreditCard size={24} color={colors.primary} />
                            <Text style={styles.paymentMethodText}>Connect PayPal</Text>
                            <ChevronRight size={18} color={colors.textSecondary} />
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.paymentMethod}
                            onPress={() => handleConnectPayment('Bank Account')}
                          >
                            <CreditCard size={24} color={colors.primary} />
                            <Text style={styles.paymentMethodText}>Connect Bank Account</Text>
                            <ChevronRight size={18} color={colors.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.withdrawButton}
                        onPress={handleWithdraw}
                      >
                        <DollarSign size={20} color="#FFF" />
                        <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {activeSyncUpModule === 'donations' && (
                    <View style={styles.moduleContent}>
                      <Text style={styles.moduleTitle}>Donation System</Text>
                      
                      <View style={styles.donationStats}>
                        <View style={styles.donationStatCard}>
                          <Text style={styles.donationStatValue}>$185.00</Text>
                          <Text style={styles.donationStatLabel}>This Month</Text>
                        </View>
                        <View style={styles.donationStatCard}>
                          <Text style={styles.donationStatValue}>12</Text>
                          <Text style={styles.donationStatLabel}>Donors</Text>
                        </View>
                        <View style={styles.donationStatCard}>
                          <Text style={styles.donationStatValue}>$15.42</Text>
                          <Text style={styles.donationStatLabel}>Avg. Donation</Text>
                        </View>
                      </View>
                      
                      <View style={styles.donationsList}>
                        <Text style={styles.donationsListTitle}>Recent Donations</Text>
                        
                        {donationsData.map((donation) => (
                          <View key={donation.id} style={styles.donationItem}>
                            <View style={styles.donationInfo}>
                              <Text style={styles.donationAmount}>{donation.amount}</Text>
                              <View style={styles.donationDetails}>
                                <Text style={styles.donationName}>{donation.name}</Text>
                                <Text style={styles.donationDate}>{donation.date}</Text>
                                <Text style={styles.donationMessage}>"{donation.message}"</Text>
                              </View>
                            </View>
                            <TouchableOpacity 
                              style={styles.thankButton}
                              onPress={() => handleThankDonor(donation.name)}
                            >
                              <Heart size={16} color={colors.primary} />
                              <Text style={styles.thankButtonText}>Thank</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                      
                      <View style={styles.donationLinkSection}>
                        <Text style={styles.donationLinkTitle}>Your Donation Link</Text>
                        <View style={styles.donationLinkContainer}>
                          <Text style={styles.donationLink}>donate.freq.com/{currentUser?.username || 'username'}</Text>
                          <TouchableOpacity style={styles.copyButton}>
                            <Text style={styles.copyButtonText}>Copy</Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.shareButton}>
                          <Share2 size={18} color={colors.text} />
                          <Text style={styles.shareButtonText}>Share Link</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  
                  {activeSyncUpModule === 'syncit' && (
                    <View style={styles.moduleContent}>
                      <Text style={styles.moduleTitle}>SYNCit Integration</Text>
                      
                      <View style={styles.syncitStatus}>
                        <View style={styles.syncitStatusIndicator}>
                          <View style={styles.statusDot} />
                          <Text style={styles.syncitStatusText}>Not Configured</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.syncitSetupButton}
                          onPress={handleSyncItSetup}
                        >
                          <Settings size={18} color={colors.text} />
                          <Text style={styles.syncitSetupButtonText}>Setup</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.syncitInfo}>
                        <Text style={styles.syncitInfoTitle}>What is SYNCit?</Text>
                        <Text style={styles.syncitInfoText}>
                          SYNCit allows you to make your music available for sync licensing opportunities in film, TV, commercials, and more. Configure your licensing options and start earning additional revenue from your music.
                        </Text>
                      </View>
                      
                      <View style={styles.syncitFeatures}>
                        <View style={styles.syncitFeatureItem}>
                          <View style={styles.syncitFeatureIcon}>
                            <Music size={24} color={colors.primary} />
                          </View>
                          <Text style={styles.syncitFeatureTitle}>License Your Music</Text>
                          <Text style={styles.syncitFeatureText}>Make your tracks available for sync opportunities</Text>
                        </View>
                        
                        <View style={styles.syncitFeatureItem}>
                          <View style={styles.syncitFeatureIcon}>
                            <DollarSign size={24} color={colors.primary} />
                          </View>
                          <Text style={styles.syncitFeatureTitle}>Set Your Rates</Text>
                          <Text style={styles.syncitFeatureText}>Configure pricing for different usage types</Text>
                        </View>
                        
                        <View style={styles.syncitFeatureItem}>
                          <View style={styles.syncitFeatureIcon}>
                            <BarChart size={24} color={colors.primary} />
                          </View>
                          <Text style={styles.syncitFeatureTitle}>Track Usage</Text>
                          <Text style={styles.syncitFeatureText}>Monitor where your music is being used</Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.getStartedButton}
                        onPress={handleSyncItSetup}
                      >
                        <Text style={styles.getStartedButtonText}>Get Started with SYNCit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          ) : (
            <>
              <Text style={styles.syncUpTitle}>SyncUP Dashboard</Text>
              <Text style={styles.syncUpSubtitle}>Manage your music business in one place</Text>
              
              <View style={styles.syncUpModulesGrid}>
                {syncUpModules.map(module => (
                  <TouchableOpacity
                    key={module.id}
                    style={styles.syncUpModuleCard}
                    onPress={() => handleSyncUpModuleSelect(module.id)}
                  >
                    <View style={styles.syncUpModuleIconContainer}>
                      {module.icon === 'chart' && <BarChart size={28} color={colors.primary} />}
                      {module.icon === 'users' && <Users size={28} color={colors.primary} />}
                      {module.icon === 'file' && <FileText size={28} color={colors.primary} />}
                      {module.icon === 'money' && <DollarSign size={28} color={colors.primary} />}
                      {module.icon === 'heart' && <Heart size={28} color={colors.primary} />}
                      {module.icon === 'sync' && <Zap size={28} color={colors.primary} />}
                    </View>
                    <Text style={styles.syncUpModuleName}>{module.name}</Text>
                    <Text style={styles.syncUpModuleDescription}>{module.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      ) : showOpportunities ? (
        <View style={styles.opportunitiesContainer}>
          <View style={styles.opportunitiesHeader}>
            <Text style={styles.sectionTitle}>Sync Opportunities</Text>
            <View style={styles.opportunitiesActions}>
              <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
                <Filter size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.searchButton}>
                <Search size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.sectionSubtitle}>Find opportunities to license your music</Text>
          
          {showFilters && (
            <View style={styles.filtersContainer}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Genre:</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity 
                    style={[styles.filterOption, filterGenre === 'All' && styles.filterOptionActive]}
                    onPress={() => setFilterGenre('All')}
                  >
                    <Text style={[styles.filterOptionText, filterGenre === 'All' && styles.filterOptionTextActive]}>All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.filterOption, filterGenre === 'Electronic' && styles.filterOptionActive]}
                    onPress={() => setFilterGenre('Electronic')}
                  >
                    <Text style={[styles.filterOptionText, filterGenre === 'Electronic' && styles.filterOptionTextActive]}>Electronic</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.filterOption, filterGenre === 'Pop' && styles.filterOptionActive]}
                    onPress={() => setFilterGenre('Pop')}
                  >
                    <Text style={[styles.filterOptionText, filterGenre === 'Pop' && styles.filterOptionTextActive]}>Pop</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.filterOption, filterGenre === 'Orchestral' && styles.filterOptionActive]}
                    onPress={() => setFilterGenre('Orchestral')}
                  >
                    <Text style={[styles.filterOptionText, filterGenre === 'Orchestral' && styles.filterOptionTextActive]}>Orchestral</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          
          <View style={styles.opportunitiesList}>
            {opportunitiesData.map((opportunity) => (
              <View key={opportunity.id} style={styles.opportunityCard}>
                <View style={styles.opportunityHeader}>
                  <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
                  <View style={styles.opportunityStatus}>
                    <Text style={styles.opportunityStatusText}>OPEN</Text>
                  </View>
                </View>
                
                <View style={styles.opportunityDetails}>
                  <View style={styles.opportunityDetailItem}>
                    <Text style={styles.opportunityDetailLabel}>Company:</Text>
                    <Text style={styles.opportunityDetailValue}>{opportunity.company}</Text>
                  </View>
                  
                  <View style={styles.opportunityDetailItem}>
                    <Text style={styles.opportunityDetailLabel}>Deadline:</Text>
                    <Text style={styles.opportunityDetailValue}>{opportunity.deadline}</Text>
                  </View>
                  
                  <View style={styles.opportunityDetailItem}>
                    <Text style={styles.opportunityDetailLabel}>Compensation:</Text>
                    <Text style={styles.opportunityDetailValue}>{opportunity.compensation}</Text>
                  </View>
                  
                  <View style={styles.opportunityDetailItem}>
                    <Text style={styles.opportunityDetailLabel}>Genre:</Text>
                    <Text style={styles.opportunityDetailValue}>{opportunity.genre}</Text>
                  </View>
                </View>
                
                <Text style={styles.opportunityDescription}>{opportunity.description}</Text>
                
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => {
                    Alert.alert(
                      opportunity.title,
                      `Requirements: ${opportunity.requirements}

Submission Process: ${opportunity.submissionProcess}`,
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Apply Now", onPress: () => handleApplyToOpportunity(opportunity.id) }
                      ]
                    );
                  }}
                >
                  <Text style={styles.viewDetailsButtonText}>View Details</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => handleApplyToOpportunity(opportunity.id)}
                >
                  <Text style={styles.applyButtonText}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => Alert.alert("View All", "This would show all available opportunities.")}
          >
            <Text style={styles.viewAllButtonText}>View All Opportunities</Text>
          </TouchableOpacity>
        </View>
      ) : showSubmissions ? (
        <View style={styles.submissionsContainer}>
          <Text style={styles.sectionTitle}>Your Submissions</Text>
          <Text style={styles.sectionSubtitle}>Track the status of your submitted tracks</Text>
          
          <View style={styles.submissionsList}>
            {submittedTracksData.map((submission) => (
              <View key={submission.id} style={styles.submissionCard}>
                <View style={styles.submissionHeader}>
                  <Text style={styles.submissionTitle}>{submission.title}</Text>
                  <View style={[
                    styles.submissionStatus,
                    submission.status === 'Selected for Shortlist' ? styles.submissionStatusSelected :
                    submission.status === 'Not Selected' ? styles.submissionStatusRejected :
                    styles.submissionStatusPending
                  ]}>
                    <Text style={styles.submissionStatusText}>{submission.status}</Text>
                  </View>
                </View>
                
                <View style={styles.submissionDetails}>
                  <View style={styles.submissionDetailItem}>
                    <Text style={styles.submissionDetailLabel}>Opportunity:</Text>
                    <Text style={styles.submissionDetailValue}>{submission.opportunity}</Text>
                  </View>
                  
                  <View style={styles.submissionDetailItem}>
                    <Text style={styles.submissionDetailLabel}>Submitted:</Text>
                    <Text style={styles.submissionDetailValue}>{submission.submittedDate}</Text>
                  </View>
                </View>
                
                {submission.feedback && (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackLabel}>Feedback:</Text>
                    <Text style={styles.feedbackText}>{submission.feedback}</Text>
                  </View>
                )}
                
                <View style={styles.submissionActions}>
                  <TouchableOpacity 
                    style={styles.submissionAction}
                    onPress={() => Alert.alert("View Details", `View details for ${submission.title}`)}
                  >
                    <Text style={styles.submissionActionText}>View Details</Text>
                  </TouchableOpacity>
                  
                  {submission.status === 'Not Selected' && (
                    <TouchableOpacity 
                      style={styles.submissionAction}
                      onPress={() => Alert.alert("Submit Again", `Submit ${submission.title} to another opportunity`)}
                    >
                      <Text style={styles.submissionActionText}>Submit Again</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.newSubmissionButton}
            onPress={() => handleOpportunitiesToggle()}
          >
            <Text style={styles.newSubmissionButtonText}>Find New Opportunities</Text>
          </TouchableOpacity>
        </View>
      ) : showCatalog ? (
        <View style={styles.catalogContainer}>
          <View style={styles.catalogHeader}>
            <Text style={styles.sectionTitle}>Your Catalog</Text>
            <TouchableOpacity style={styles.addTrackButton} onPress={() => {
              // Check if user is logged in
              if (!isLoggedIn) {
                setShowLoginModal(true);
                return;
              }
              
              // Navigate to upload track modal or screen
              // For now, we'll show an alert since we don't have a dedicated upload route
              Alert.alert(
                "Upload Track",
                "This would open the track upload interface. The upload functionality is available through the library tab.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Go to Library", onPress: () => router.push('/(tabs)/library') }
                ]
              );
            }}>
              <PlusCircle size={20} color={colors.primary} />
              <Text style={styles.addTrackButtonText}>Add Track</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionSubtitle}>Manage your tracks for sync opportunities</Text>
          
          <View style={styles.searchFilterContainer}>
            <View style={styles.searchBox}>
              <Search size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search your catalog..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
              <Filter size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {showFilters && (
            <View style={styles.filtersContainer}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Status:</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity style={[styles.filterOption, styles.filterOptionActive]}>
                    <Text style={[styles.filterOptionText, styles.filterOptionTextActive]}>All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterOption}>
                    <Text style={styles.filterOptionText}>Available</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterOption}>
                    <Text style={styles.filterOptionText}>Not Available</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Genre:</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity style={[styles.filterOption, styles.filterOptionActive]}>
                    <Text style={[styles.filterOptionText, styles.filterOptionTextActive]}>All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterOption}>
                    <Text style={styles.filterOptionText}>Electronic</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterOption}>
                    <Text style={styles.filterOptionText}>Ambient</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          
          <View style={styles.catalogList}>
            {catalogData.map((track) => (
              <View key={track.id} style={styles.catalogItem}>
                <View style={styles.catalogItemLeft}>
                  <Image source={{ uri: track.coverArt }} style={styles.catalogCoverArt} />
                  <View style={styles.catalogTrackInfo}>
                    <Text style={styles.catalogTrackTitle}>{track.title}</Text>
                    <Text style={styles.catalogTrackDetails}>
                      {track.genre} • {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </Text>
                    <View style={[
                      styles.catalogTrackStatus,
                      track.status === 'Available for Sync' ? styles.catalogTrackStatusAvailable : styles.catalogTrackStatusUnavailable
                    ]}>
                      <Text style={styles.catalogTrackStatusText}>{track.status}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.catalogItemActions}>
                  <TouchableOpacity 
                    style={styles.catalogItemAction}
                    onPress={() => handleTrackStatusToggle(track.id)}
                  >
                    {track.status === 'Available for Sync' ? (
                      <Lock size={20} color={colors.textSecondary} />
                    ) : (
                      <Lock size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.catalogItemAction}
                    onPress={() => handleTrackDetails(track.id)}
                  >
                    <Info size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.syncItButton}
            onPress={handleSyncItSetup}
          >
            <Zap size={20} color="#FFF" />
            <Text style={styles.syncItButtonText}>Configure SYNCit Settings</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      
      {showSubmissionForm && (
        <View style={styles.submissionFormOverlay}>
          <View style={styles.submissionForm}>
            <View style={styles.submissionFormHeader}>
              <Text style={styles.submissionFormTitle}>Submit Tracks</Text>
              <TouchableOpacity 
                style={styles.submissionFormClose}
                onPress={() => {
                  setShowSubmissionForm(false);
                  setSelectedSubmissionTracks([]);
                  setSubmissionNote('');
                }}
              >
                <XCircle size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.submissionFormSubtitle}>
              Select tracks to submit for {opportunitiesData.find(o => o.id === selectedOpportunity)?.title}
            </Text>
            
            <View style={styles.submissionTracksList}>
              {catalogData.map((track) => (
                <TouchableOpacity 
                  key={track.id}
                  style={styles.submissionTrackItem}
                  onPress={() => handleToggleTrackSelection(track.id)}
                >
                  <View style={styles.submissionTrackCheckbox}>
                    {selectedSubmissionTracks && selectedSubmissionTracks.includes(track.id) ? (
                      <CheckCircle size={24} color={colors.primary} />
                    ) : (
                      <Circle size={24} color={colors.textSecondary} />
                    )}
                  </View>
                  
                  <Image source={{ uri: track.coverArt }} style={styles.submissionTrackCover} />
                  
                  <View style={styles.submissionTrackInfo}>
                    <Text style={styles.submissionTrackTitle}>{track.title}</Text>
                    <Text style={styles.submissionTrackDetails}>
                      {track.genre} • {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.submissionNoteContainer}>
              <Text style={styles.submissionNoteLabel}>Add a note (optional):</Text>
              <TextInput
                style={styles.submissionNoteInput}
                placeholder="Tell us why your tracks are perfect for this opportunity..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                value={submissionNote}
                onChangeText={setSubmissionNote}
              />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.submitTracksButton,
                (!selectedSubmissionTracks || selectedSubmissionTracks.length === 0) && styles.submitTracksButtonDisabled
              ]}
              onPress={handleSubmitTracks}
              disabled={!selectedSubmissionTracks || selectedSubmissionTracks.length === 0 || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Send size={20} color="#FFF" />
                  <Text style={styles.submitTracksButtonText}>Submit Tracks</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'SyncLab',
        headerRight: () => (
          <View style={styles.headerIcon}>
            <Zap size={24} color={colors.primary} />
          </View>
        ),
        headerLeft: () => (
          hasSubscription && !showSubscriptionSection ? (
            <TouchableOpacity 
              style={styles.headerBackButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ) : null
        )
      }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          { paddingBottom: getContentPaddingBottom() }
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        removeClippedSubviews={Platform.OS === 'android'}
        scrollEventThrottle={16}
      >
        {!isLoggedIn && (
          <View style={styles.loginPrompt}>
            <Lock size={24} color={colors.textSecondary} />
            <Text style={styles.loginPromptText}>
              Sign in to access SyncLab features
            </Text>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => setShowLoginModal(true)}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {isLoggedIn && (
          showSubscriptionSection ? renderSubscriptionSection() : renderDashboard()
        )}
        
        {!isLoggedIn && renderSubscriptionSection()}
      </ScrollView>

      <SignupPaymentModal
        visible={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        selectedPlan={subscriptionPlans.find(p => p.id === selectedPlan) || subscriptionPlans[1]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerBackButton: {
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  loginPrompt: {
    backgroundColor: colors.card,
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginPromptText: {
    color: colors.text,
    fontSize: 16,
    marginVertical: 12,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 8,
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  hero: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  featureHighlights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  featureItem: {
    alignItems: 'center',
    padding: 12,
  },
  featureText: {
    color: colors.textSecondary,
    marginTop: 8,
    fontSize: 14,
  },
  plansContainer: {
    padding: 24,
  },
  plansTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  plansSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    borderColor: colors.primary,
  },
  popularPlan: {
    backgroundColor: colors.cardElevated,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  planPeriod: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  subscribeButton: {
    backgroundColor: colors.cardElevated,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  selectedSubscribeButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  benefitsSection: {
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  benefitsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.cardElevated,
    padding: 16,
    borderRadius: 12,
  },
  benefitContent: {
    marginLeft: 16,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  testimonialSection: {
    padding: 24,
  },
  testimonialTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  testimonialCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  testimonialText: {
    fontSize: 16,
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 24,
  },
  testimonialAuthor: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  authorTitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Dashboard styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  timeRangeContainer: {
    position: 'relative',
  },
  timeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  timeRangeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  timeRangeDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    padding: 8,
    width: 150,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  timeRangeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  timeRangeOptionText: {
    color: colors.text,
    fontSize: 14,
  },
  timeRangeOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  subscriptionTextContainer: {
    marginLeft: 12,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subscriptionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabs: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  activeTab: {
    backgroundColor: colors.cardElevated,
  },
  tabText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
  },
  toolsSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTrendText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  toolCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeToolCard: {
    borderColor: colors.primary,
  },
  comingSoonToolCard: {
    opacity: 0.7,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.cardElevated,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  comingSoonText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  emptyProjectsState: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
  },
  emptyProjectsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyProjectsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  helpButton: {
    backgroundColor: colors.card,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  helpButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  // SyncUP styles
  syncUpContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  syncUpTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  syncUpSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  syncUpModulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  syncUpModuleCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  syncUpModuleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncUpModuleName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  syncUpModuleDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  moduleDetailContainer: {
    backgroundColor: colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  moduleContent: {
    backgroundColor: colors.background,
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  // Royalties module styles
  royaltiesChart: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 20,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  webChartPlaceholder: {
    width: '100%',
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webChartText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  royaltiesSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  platformBreakdown: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformName: {
    color: colors.text,
    fontSize: 14,
    width: 100,
  },
  platformBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.cardElevated,
    borderRadius: 4,
    marginHorizontal: 12,
  },
  platformBar: {
    height: 8,
    borderRadius: 4,
  },
  platformPercentage: {
    color: colors.textSecondary,
    fontSize: 14,
    width: 40,
    textAlign: 'right',
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  exportButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Contacts module styles
  searchContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    color: colors.text,
    fontSize: 16,
  },
  contactsList: {
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactType: {
    color: colors.primary,
    fontSize: 14,
    marginBottom: 4,
  },
  contactLastContact: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  contactAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Documents module styles
  documentsHeader: {
    flexDirection: 'row',
    backgroundColor: colors.cardElevated,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  documentsHeaderText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  documentsList: {
    marginBottom: 24,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentDate: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  documentSize: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  documentActions: {
    flexDirection: 'row',
  },
  documentAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // Earnings module styles
  earningsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  earningsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  earningsLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  earningsValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  lastPaymentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  lastPaymentTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  lastPaymentAmount: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  lastPaymentDetails: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  paymentMethods: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  paymentMethodsList: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  paymentMethodText: {
    color: colors.text,
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  withdrawButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Donations module styles
  donationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  donationStatCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  donationStatValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  donationStatLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  donationsList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  donationsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  donationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  donationAmount: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    width: 60,
  },
  donationDetails: {
    flex: 1,
  },
  donationName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  donationDate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  donationMessage: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  thankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  thankButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  donationLinkSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  donationLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  donationLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  donationLink: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
  },
  copyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  copyButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  shareButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // SYNCit module styles
  syncitStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  syncitStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9800',
    marginRight: 8,
  },
  syncitStatusText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  syncitSetupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  syncitSetupButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  syncitInfo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  syncitInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  syncitInfoText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  syncitFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  syncitFeatureItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  syncitFeatureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncitFeatureTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  syncitFeatureText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Opportunities styles
  opportunitiesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  opportunitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  opportunitiesActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  filtersContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    width: 60,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 8,
  },
  filterOption: {
    backgroundColor: colors.cardElevated,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    color: colors.text,
    fontSize: 12,
  },
  filterOptionTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  opportunitiesList: {
    marginBottom: 16,
  },
  opportunityCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  opportunityTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  opportunityStatus: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  opportunityStatusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  opportunityDetails: {
    marginBottom: 12,
  },
  opportunityDetailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  opportunityDetailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    width: 100,
  },
  opportunityDetailValue: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
  },
  opportunityDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  viewDetailsButton: {
    backgroundColor: colors.cardElevated,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  viewDetailsButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllButton: {
    backgroundColor: colors.card,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  // Submissions styles
  submissionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  submissionsList: {
    marginBottom: 16,
  },
  submissionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  submissionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  submissionStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  submissionStatusPending: {
    backgroundColor: '#FF9800',
  },
  submissionStatusSelected: {
    backgroundColor: '#4CAF50',
  },
  submissionStatusRejected: {
    backgroundColor: '#F44336',
  },
  submissionStatusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  submissionDetails: {
    marginBottom: 12,
  },
  submissionDetailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  submissionDetailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    width: 100,
  },
  submissionDetailValue: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
  },
  feedbackContainer: {
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  feedbackLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedbackText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  submissionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submissionAction: {
    backgroundColor: colors.cardElevated,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  submissionActionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  newSubmissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  newSubmissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Catalog styles
  catalogContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addTrackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addTrackButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  catalogList: {
    marginBottom: 16,
  },
  catalogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  catalogItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  catalogCoverArt: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  catalogTrackInfo: {
    flex: 1,
  },
  catalogTrackTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  catalogTrackDetails: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  catalogTrackStatus: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  catalogTrackStatusAvailable: {
    backgroundColor: '#4CAF50',
  },
  catalogTrackStatusUnavailable: {
    backgroundColor: '#F44336',
  },
  catalogTrackStatusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  catalogItemActions: {
    flexDirection: 'row',
  },
  catalogItemAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  syncItButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncItButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Submission form styles
  submissionFormOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  submissionForm: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  submissionFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  submissionFormTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  submissionFormClose: {
    padding: 4,
  },
  submissionFormSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  submissionTracksList: {
    maxHeight: 300,
  },
  submissionTrackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  submissionTrackCheckbox: {
    marginRight: 12,
  },
  submissionTrackCover: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  submissionTrackInfo: {
    flex: 1,
  },
  submissionTrackTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  submissionTrackDetails: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  submissionNoteContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  submissionNoteLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  submissionNoteInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    height: 100,
    textAlignVertical: 'top',
  },
  submitTracksButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitTracksButtonDisabled: {
    opacity: 0.7,
  },
  submitTracksButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});