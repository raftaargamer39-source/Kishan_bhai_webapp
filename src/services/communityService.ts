import {
  FarmerCommunityGroup,
  CommunityPost,
  CommunityComment,
  ContentReport,
  CommunityGroupCategory,
  CommunityPostType,
} from '../../shared/types';

const STORAGE_GROUPS_KEY = 'kb_community_groups';
const STORAGE_POSTS_KEY = 'kb_community_posts';
const STORAGE_REPORTS_KEY = 'kb_community_reports';

export const COMMUNITY_CATEGORIES: CommunityGroupCategory[] = [
  'Rice Farming',
  'Wheat Farming',
  'Cotton Farming',
  'Vegetable Farming',
  'Organic Farming',
  'Dairy Farming',
  'Modern Farming Technology',
  'Agricultural Business',
  'Irrigation and Water Management',
  'Pest and Disease Management',
  'General Farmer Discussion',
];

const SEED_GROUPS: FarmerCommunityGroup[] = [
  {
    id: 'grp_cotton_vidarbha',
    name: 'Cotton Farming Group',
    description: 'Practical field knowledge for high-yield cotton, pink bollworm traps, drip scheduling, and collective mandi selling.',
    category: 'Cotton Farming',
    location: 'Vidarbha & Saurashtra',
    cropInterest: 'Cotton',
    imageUrl: 'https://images.unsplash.com/photo-1594488556855-6b83f4b46c6a?w=400&auto=format&fit=crop&q=80',
    isPrivate: false,
    rules: [
      'Share real field experiences only with photos when possible.',
      'Always specify your soil type and irrigation source when asking questions.',
      'No unsolicited fertilizer dealership promotions.',
      'Treat fellow farmers with dignity and respect.',
    ],
    ownerId: 'usr_farmer_1',
    ownerName: 'Ramesh Patel',
    moderatorIds: ['usr_farmer_1', 'usr_champion_1'],
    memberIds: ['usr_farmer_1', 'usr_champion_1', 'usr_farmer_2', 'usr_farmer_3'],
    memberCount: 142,
    pinnedPostIds: ['post_demo_ramesh'],
    resources: [
      {
        id: 'res_1',
        title: 'ICAR Cotton Pest Advisory 2026',
        type: 'PDF',
        description: 'Official timing guidelines for pheromone trap installation and neem oil spray.',
      },
      {
        id: 'res_2',
        title: 'Micro-Irrigation Drip Schedule Sheet',
        type: 'GUIDE',
        description: 'Hours per acre calculation based on ambient temperature and canopy size.',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 'grp_organic_anandpur',
    name: 'Anandpur Organic Krishi Sangh',
    description: 'Zero-budget natural farming, Jeevamrut preparation, bio-pesticides, and organic certification guidance.',
    category: 'Organic Farming',
    location: 'Anandpur, Gujarat',
    cropInterest: 'Groundnut, Pulses, Mustard',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
    isPrivate: false,
    rules: [
      'Only chemical-free and natural farming inputs discussed here.',
      'Share authentic recipe measurements for Dashaparni Ark and Jeevamrut.',
    ],
    ownerId: 'usr_champion_1',
    ownerName: 'Anita Devi',
    moderatorIds: ['usr_champion_1'],
    memberIds: ['usr_champion_1', 'usr_farmer_1'],
    memberCount: 88,
    resources: [
      {
        id: 'res_org_1',
        title: 'Jeevamrut 7-Day Fermentation Chart',
        type: 'GUIDE',
        description: 'Step-by-step ratio of cow dung, urine, jaggery, and gram flour.',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
  },
  {
    id: 'grp_wheat_innovators',
    name: 'Malwa Wheat Innovators',
    description: 'Wheat varieties (Sharbati, Lokwan, HD 2967), laser land leveling, and terminal heat management.',
    category: 'Wheat Farming',
    location: 'Malwa & Central Plains',
    cropInterest: 'Wheat, Gram',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=80',
    isPrivate: false,
    rules: ['Mention seed treatment details when reporting germination issues.'],
    ownerId: 'usr_farmer_2',
    ownerName: 'Balwinder Singh',
    moderatorIds: ['usr_farmer_2'],
    memberIds: ['usr_farmer_2', 'usr_farmer_3'],
    memberCount: 215,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
  {
    id: 'grp_nashik_polyhouse',
    name: 'Nashik Polyhouse & Vegetable Circle',
    description: 'High-density capsicum, Dutch roses, cherry tomatoes, and climate control in naturally ventilated polyhouses.',
    category: 'Vegetable Farming',
    location: 'Nashik, Maharashtra',
    cropInterest: 'Tomatoes, Capsicum, Cucumber',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251e?w=400&auto=format&fit=crop&q=80',
    isPrivate: true,
    rules: [
      'Private group for operational polyhouse owners.',
      'Active participation and verified farm acreage required.',
      'Keep discussions strictly focused on commercial floriculture & protected vegetables.',
    ],
    ownerId: 'usr_farmer_3',
    ownerName: 'Pravin Jadhav',
    moderatorIds: ['usr_farmer_3'],
    memberIds: ['usr_farmer_3'],
    pendingRequestIds: ['usr_farmer_1'],
    memberCount: 46,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
  {
    id: 'grp_water_tech',
    name: 'Solar Drip & Micro-Irrigation Network',
    description: 'Optimizing pump operations, government solar subsidies (PM-KUSUM), drip venturi filters, and borewell recharge.',
    category: 'Irrigation and Water Management',
    location: 'All India Community',
    cropInterest: 'All Irrigated Crops',
    imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&auto=format&fit=crop&q=80',
    isPrivate: false,
    rules: ['Share installation photos to troubleshoot line pressure drops.'],
    ownerId: 'usr_champion_1',
    ownerName: 'Anita Devi',
    moderatorIds: ['usr_champion_1'],
    memberIds: ['usr_champion_1', 'usr_farmer_1', 'usr_farmer_2'],
    memberCount: 167,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
];

const SEED_POSTS: CommunityPost[] = [
  {
    id: 'post_demo_ramesh',
    authorId: 'usr_farmer_1',
    authorName: 'Ramesh Patel',
    authorRole: 'Cotton Smallholder',
    authorVillage: 'Anandpur, Gujarat',
    authorAvatar: 'RP',
    groupId: 'grp_cotton_vidarbha',
    groupName: 'Cotton Farming Group',
    category: 'Cotton Farming',
    postType: 'QUESTION',
    content: 'Has anyone tried a more efficient irrigation schedule for cotton during hot weather? I would like to learn from other farmers\' experiences.',
    images: [
      'https://images.unsplash.com/photo-1594488556855-6b83f4b46c6a?w=800&auto=format&fit=crop&q=80',
    ],
    likesCount: 18,
    likedUserIds: ['usr_champion_1', 'usr_farmer_2'],
    commentsCount: 3,
    savedUserIds: ['usr_farmer_2'],
    isPinned: true,
    isHelpfulAnswered: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    comments: [
      {
        id: 'comm_1',
        postId: 'post_demo_ramesh',
        authorId: 'usr_farmer_2',
        authorName: 'Balwinder Singh',
        authorVillage: 'Mandi Gobindgarh',
        content: 'Ramesh ji, on black soil we shifted drip operation to 3:30 AM before sunrise for 1.5 hours instead of afternoon. Leaf drop reduced by nearly 25% and soil holds moisture until sunset.',
        likesCount: 9,
        likedUserIds: ['usr_farmer_1'],
        isHelpful: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
        replies: [
          {
            id: 'comm_1_rep_1',
            postId: 'post_demo_ramesh',
            parentId: 'comm_1',
            authorId: 'usr_farmer_1',
            authorName: 'Ramesh Patel',
            authorVillage: 'Anandpur, Gujarat',
            content: 'Thank you Balwinder bhai! Are you using inline drip with 2 litre/hour drippers or higher discharge?',
            likesCount: 3,
            likedUserIds: ['usr_farmer_2'],
            createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
          },
        ],
      },
      {
        id: 'comm_2',
        postId: 'post_demo_ramesh',
        authorId: 'usr_champion_1',
        authorName: 'Anita Devi',
        authorVillage: 'Anandpur',
        content: 'Also remember to apply straw or sugarcane bagasse mulch along the ridge. It cuts evaporative loss dramatically during April-May peak heat.',
        likesCount: 5,
        likedUserIds: ['usr_farmer_1'],
        isHelpful: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      },
    ],
  },
  {
    id: 'post_poll_tech',
    authorId: 'usr_champion_1',
    authorName: 'Anita Devi',
    authorRole: 'Village Champion',
    authorVillage: 'Anandpur, Gujarat',
    authorAvatar: 'AD',
    groupId: 'grp_water_tech',
    groupName: 'Solar Drip & Micro-Irrigation Network',
    category: 'Modern Farming Technology',
    postType: 'DISCUSSION',
    content: 'Kishan brothers and sisters! Which digital or mechanical farm technology gave you the best economic return on investment this season?',
    poll: {
      id: 'poll_1',
      question: 'Highest ROI farm technology this season:',
      totalVotes: 84,
      options: [
        { id: 'opt_1', text: 'Solar Drip with Automated Line Timer', votes: 41, votedUserIds: ['usr_farmer_1'] },
        { id: 'opt_2', text: 'Zero-Till Super Seeder / Happy Seeder', votes: 26, votedUserIds: [] },
        { id: 'opt_3', text: 'Drone Service for Targeted Micronutrient Spray', votes: 12, votedUserIds: [] },
        { id: 'opt_4', text: 'Digital Soil N-P-K & Moisture Sensor', votes: 5, votedUserIds: [] },
      ],
    },
    likesCount: 24,
    likedUserIds: ['usr_farmer_1', 'usr_farmer_3'],
    commentsCount: 2,
    savedUserIds: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    comments: [
      {
        id: 'comm_poll_1',
        postId: 'post_poll_tech',
        authorId: 'usr_farmer_3',
        authorName: 'Pravin Jadhav',
        content: 'Solar pump timer saved us Rs 12,000 in diesel generator backup during erratic village grid cuts. Payback in just one harvest.',
        likesCount: 4,
        likedUserIds: ['usr_champion_1'],
        createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      },
    ],
  },
  {
    id: 'post_chili_yellow',
    authorId: 'usr_farmer_4',
    authorName: 'Suresh Deshmukh',
    authorRole: 'Vegetable Farmer',
    authorVillage: 'Badnera, Maharashtra',
    authorAvatar: 'SD',
    category: 'Pest and Disease Management',
    postType: 'QUESTION',
    content: 'Why are lower leaves on my chili crop turning pale yellow with faint upward curling? It rained heavily 3 days ago followed by extreme sunny heat.',
    images: [
      'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251e?w=800&auto=format&fit=crop&q=80',
    ],
    likesCount: 11,
    likedUserIds: [],
    commentsCount: 2,
    savedUserIds: ['usr_farmer_1'],
    isHelpfulAnswered: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    comments: [
      {
        id: 'comm_chili_kvk',
        postId: 'post_chili_yellow',
        authorId: 'usr_expert_1',
        authorName: 'Dr. Vinod Sharma (Agronomist)',
        authorVillage: 'Krishi Vigyan Kendra',
        content: 'Inspect the underside of young leaves with a magnifying glass for yellow mite or thrip activity. Also, post heavy rain in black soil, roots suffer temporary hypoxia (oxygen starvation). Drain standing water immediately and drench with Trichoderma harzianum or spray 19:19:19 at 5g/L once soil aerates.',
        likesCount: 16,
        likedUserIds: ['usr_farmer_4', 'usr_farmer_1'],
        isHelpful: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      },
    ],
  },
  {
    id: 'post_wheat_tip',
    authorId: 'usr_farmer_2',
    authorName: 'Balwinder Singh',
    authorRole: 'Wheat Grower',
    authorVillage: 'Mandi Gobindgarh',
    authorAvatar: 'BS',
    groupId: 'grp_wheat_innovators',
    groupName: 'Malwa Wheat Innovators',
    category: 'Farming Tips',
    postType: 'TIP',
    content: 'Important rabi wheat tip: During milk and dough stage, only irrigate when air velocity is below 8 km/h. High winds right after irrigation cause severe crop lodging (falling over), losing up to 30% yield.',
    likesCount: 31,
    likedUserIds: ['usr_farmer_1', 'usr_champion_1'],
    commentsCount: 1,
    savedUserIds: ['usr_farmer_1'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    comments: [
      {
        id: 'comm_wheat_1',
        postId: 'post_wheat_tip',
        authorId: 'usr_farmer_1',
        authorName: 'Ramesh Patel',
        content: 'Very timely reminder Balwinder ji. We check wind forecast on Kishan Bhai app before starting tubewell now.',
        likesCount: 7,
        likedUserIds: ['usr_farmer_2'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      },
    ],
  },
  {
    id: 'post_announcement_1',
    authorId: 'usr_admin',
    authorName: 'Kishan Bhai Agronomy Desk',
    authorRole: 'Official Advisory',
    authorVillage: 'National Agri-Network',
    authorAvatar: 'KB',
    category: 'Announcements',
    postType: 'ANNOUNCEMENT',
    content: 'Official Agro-Advisory: Central and Western agricultural zones will experience an upcoming 4-day dry weather window. This is the recommended window for intercultural weeding, neem-cake application, and collective cluster procurement dispatch.',
    likesCount: 42,
    likedUserIds: ['usr_farmer_1', 'usr_farmer_2', 'usr_farmer_3'],
    commentsCount: 0,
    savedUserIds: ['usr_farmer_1', 'usr_champion_1'],
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

class CommunityService {
  private getGroupsFromStorage(): FarmerCommunityGroup[] {
    try {
      const data = localStorage.getItem(STORAGE_GROUPS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read failed:', e);
    }
    this.saveGroupsToStorage(SEED_GROUPS);
    return SEED_GROUPS;
  }

  private saveGroupsToStorage(groups: FarmerCommunityGroup[]): void {
    try {
      localStorage.setItem(STORAGE_GROUPS_KEY, JSON.stringify(groups));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  }

  private getPostsFromStorage(): CommunityPost[] {
    try {
      const data = localStorage.getItem(STORAGE_POSTS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read failed:', e);
    }
    this.savePostsToStorage(SEED_POSTS);
    return SEED_POSTS;
  }

  private savePostsToStorage(posts: CommunityPost[]): void {
    try {
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  }

  // Group APIs
  async getGroups(): Promise<FarmerCommunityGroup[]> {
    try {
      const res = await fetch('/api/community/groups');
      if (res.ok) {
        const data = await res.json();
        if (data.groups && data.groups.length > 0) {
          this.saveGroupsToStorage(data.groups);
          return data.groups;
        }
      }
    } catch {
      // Fallback to local
    }
    return this.getGroupsFromStorage();
  }

  async createGroup(groupData: Partial<FarmerCommunityGroup>): Promise<FarmerCommunityGroup> {
    const newGroup: FarmerCommunityGroup = {
      id: `grp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: groupData.name || 'Unnamed Group',
      description: groupData.description || '',
      category: groupData.category || 'General Farmer Discussion',
      location: groupData.location || 'India',
      cropInterest: groupData.cropInterest || 'All Crops',
      imageUrl: groupData.imageUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
      isPrivate: !!groupData.isPrivate,
      rules: groupData.rules || ['Be respectful', 'Share authentic farming experiences'],
      ownerId: groupData.ownerId || 'usr_farmer_1',
      ownerName: groupData.ownerName || 'Ramesh Patel',
      moderatorIds: [groupData.ownerId || 'usr_farmer_1'],
      memberIds: [groupData.ownerId || 'usr_farmer_1'],
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/community/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.group) {
          const current = this.getGroupsFromStorage();
          this.saveGroupsToStorage([data.group, ...current]);
          return data.group;
        }
      }
    } catch {
      // Fallback
    }

    const current = this.getGroupsFromStorage();
    const updated = [newGroup, ...current];
    this.saveGroupsToStorage(updated);
    return newGroup;
  }

  async joinGroup(groupId: string, userId: string, userName?: string): Promise<{ success: boolean; isPending?: boolean; group: FarmerCommunityGroup }> {
    const groups = this.getGroupsFromStorage();
    const group = groups.find((g) => g.id === groupId);
    if (!group) throw new Error('Group not found');

    if (group.memberIds.includes(userId)) {
      return { success: true, group };
    }

    if (group.isPrivate) {
      group.pendingRequestIds = group.pendingRequestIds || [];
      if (!group.pendingRequestIds.includes(userId)) {
        group.pendingRequestIds.push(userId);
      }
      this.saveGroupsToStorage(groups);
      return { success: true, isPending: true, group };
    }

    group.memberIds.push(userId);
    group.memberCount = group.memberIds.length;
    this.saveGroupsToStorage(groups);

    try {
      fetch(`/api/community/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName }),
      }).catch(() => {});
    } catch {}

    return { success: true, isPending: false, group };
  }

  async leaveGroup(groupId: string, userId: string): Promise<FarmerCommunityGroup> {
    const groups = this.getGroupsFromStorage();
    const group = groups.find((g) => g.id === groupId);
    if (!group) throw new Error('Group not found');

    group.memberIds = group.memberIds.filter((id) => id !== userId);
    group.memberCount = group.memberIds.length;
    this.saveGroupsToStorage(groups);

    try {
      fetch(`/api/community/groups/${groupId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).catch(() => {});
    } catch {}

    return group;
  }

  async approveMemberRequest(groupId: string, applicantId: string): Promise<FarmerCommunityGroup> {
    const groups = this.getGroupsFromStorage();
    const group = groups.find((g) => g.id === groupId);
    if (!group) throw new Error('Group not found');

    group.pendingRequestIds = (group.pendingRequestIds || []).filter((id) => id !== applicantId);
    if (!group.memberIds.includes(applicantId)) {
      group.memberIds.push(applicantId);
      group.memberCount = group.memberIds.length;
    }
    this.saveGroupsToStorage(groups);
    return group;
  }

  // Post APIs
  async getPosts(filter = 'For You', groupId?: string, searchQuery?: string, currentUserId?: string): Promise<CommunityPost[]> {
    let posts = this.getPostsFromStorage();

    if (groupId) {
      posts = posts.filter((p) => p.groupId === groupId);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      posts = posts.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.groupName && p.groupName.toLowerCase().includes(q))
      );
    }

    switch (filter) {
      case 'Latest':
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'Following':
        // For demonstration, filter posts from champion or prominent farmers
        posts = posts.filter((p) => p.authorId !== currentUserId);
        break;
      case 'My Groups':
        const groups = this.getGroupsFromStorage();
        const userGroupIds = groups
          .filter((g) => currentUserId && g.memberIds.includes(currentUserId))
          .map((g) => g.id);
        posts = posts.filter((p) => p.groupId && userGroupIds.includes(p.groupId));
        break;
      case 'Questions':
        posts = posts.filter((p) => p.postType === 'QUESTION');
        break;
      case 'Farming Tips':
        posts = posts.filter((p) => p.postType === 'TIP');
        break;
      case 'Announcements':
        posts = posts.filter((p) => p.postType === 'ANNOUNCEMENT');
        break;
      case 'For You':
      default:
        // Pinned posts first, then sorted by engagement + date
        posts.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
    }

    return posts;
  }

  async createPost(postData: Partial<CommunityPost>): Promise<CommunityPost> {
    const newPost: CommunityPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      authorId: postData.authorId || 'usr_farmer_1',
      authorName: postData.authorName || 'Ramesh Patel',
      authorRole: postData.authorRole || 'Farmer',
      authorVillage: postData.authorVillage || 'Anandpur, Gujarat',
      authorAvatar: postData.authorAvatar || 'RP',
      groupId: postData.groupId,
      groupName: postData.groupName,
      category: postData.category || 'General Farmer Discussion',
      postType: postData.postType || 'DISCUSSION',
      content: postData.content || '',
      images: postData.images || [],
      poll: postData.poll,
      likesCount: 0,
      likedUserIds: [],
      commentsCount: 0,
      comments: [],
      savedUserIds: [],
      createdAt: new Date().toISOString(),
    };

    const posts = this.getPostsFromStorage();
    const updated = [newPost, ...posts];
    this.savePostsToStorage(updated);

    try {
      fetch('/api/community/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      }).catch(() => {});
    } catch {}

    return newPost;
  }

  async toggleLikePost(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const posts = this.getPostsFromStorage();
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    const index = post.likedUserIds.indexOf(userId);
    let liked = false;
    if (index >= 0) {
      post.likedUserIds.splice(index, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likedUserIds.push(userId);
      post.likesCount += 1;
      liked = true;
    }
    this.savePostsToStorage(posts);
    return { liked, likesCount: post.likesCount };
  }

  async toggleSavePost(postId: string, userId: string): Promise<{ saved: boolean }> {
    const posts = this.getPostsFromStorage();
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    const index = post.savedUserIds.indexOf(userId);
    let saved = false;
    if (index >= 0) {
      post.savedUserIds.splice(index, 1);
    } else {
      post.savedUserIds.push(userId);
      saved = true;
    }
    this.savePostsToStorage(posts);
    return { saved };
  }

  async votePoll(postId: string, optionId: string, userId: string): Promise<CommunityPost> {
    const posts = this.getPostsFromStorage();
    const post = posts.find((p) => p.id === postId);
    if (!post || !post.poll) throw new Error('Poll not found on post');

    // Remove any previous vote from this user in this poll
    let userHadVoted = false;
    post.poll.options.forEach((opt) => {
      const idx = opt.votedUserIds.indexOf(userId);
      if (idx >= 0) {
        opt.votedUserIds.splice(idx, 1);
        opt.votes = Math.max(0, opt.votes - 1);
        userHadVoted = true;
      }
    });

    const targetOpt = post.poll.options.find((opt) => opt.id === optionId);
    if (targetOpt) {
      targetOpt.votedUserIds.push(userId);
      targetOpt.votes += 1;
      if (!userHadVoted) {
        post.poll.totalVotes += 1;
      }
    }

    this.savePostsToStorage(posts);
    return post;
  }

  async addComment(postId: string, commentData: Partial<CommunityComment>): Promise<CommunityComment> {
    const posts = this.getPostsFromStorage();
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    const newComment: CommunityComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId,
      authorId: commentData.authorId || 'usr_farmer_1',
      authorName: commentData.authorName || 'Ramesh Patel',
      authorVillage: commentData.authorVillage || 'Anandpur, Gujarat',
      authorAvatar: commentData.authorAvatar || 'RP',
      content: commentData.content || '',
      likesCount: 0,
      likedUserIds: [],
      isHelpful: false,
      replies: [],
      createdAt: new Date().toISOString(),
    };

    post.comments = post.comments || [];
    post.comments.push(newComment);
    post.commentsCount = post.comments.length;
    this.savePostsToStorage(posts);
    return newComment;
  }

  async replyComment(postId: string, parentCommentId: string, replyData: Partial<CommunityComment>): Promise<CommunityComment> {
    const posts = this.getPostsFromStorage();
    const post = posts.find((p) => p.id === postId);
    if (!post || !post.comments) throw new Error('Post not found');

    const parent = post.comments.find((c) => c.id === parentCommentId);
    if (!parent) throw new Error('Parent comment not found');

    const newReply: CommunityComment = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId,
      parentId: parentCommentId,
      authorId: replyData.authorId || 'usr_farmer_1',
      authorName: replyData.authorName || 'Ramesh Patel',
      authorVillage: replyData.authorVillage || 'Anandpur, Gujarat',
      authorAvatar: replyData.authorAvatar || 'RP',
      content: replyData.content || '',
      likesCount: 0,
      likedUserIds: [],
      createdAt: new Date().toISOString(),
    };

    parent.replies = parent.replies || [];
    parent.replies.push(newReply);
    post.commentsCount += 1;
    this.savePostsToStorage(posts);
    return newReply;
  }

  async toggleLikeComment(postId: string, commentId: string, userId: string): Promise<boolean> {
    const posts = this.getPostsFromStorage();
    const post = posts.find((p) => p.id === postId);
    if (!post || !post.comments) return false;

    let target: CommunityComment | undefined;
    for (const c of post.comments) {
      if (c.id === commentId) {
        target = c;
        break;
      }
      if (c.replies) {
        const found = c.replies.find((r) => r.id === commentId);
        if (found) {
          target = found;
          break;
        }
      }
    }

    if (!target) return false;

    const idx = target.likedUserIds.indexOf(userId);
    let liked = false;
    if (idx >= 0) {
      target.likedUserIds.splice(idx, 1);
      target.likesCount = Math.max(0, target.likesCount - 1);
    } else {
      target.likedUserIds.push(userId);
      target.likesCount += 1;
      liked = true;
    }
    this.savePostsToStorage(posts);
    return liked;
  }

  async markCommentHelpful(postId: string, commentId: string): Promise<boolean> {
    const posts = this.getPostsFromStorage();
    const post = posts.find((p) => p.id === postId);
    if (!post || !post.comments) return false;

    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) return false;

    comment.isHelpful = !comment.isHelpful;
    post.isHelpfulAnswered = post.comments.some((c) => c.isHelpful);
    this.savePostsToStorage(posts);
    return comment.isHelpful;
  }

  async deleteComment(postId: string, commentId: string, userId: string): Promise<boolean> {
    const posts = this.getPostsFromStorage();
    const post = posts.find((p) => p.id === postId);
    if (!post || !post.comments) return false;

    const originalLength = post.comments.length;
    post.comments = post.comments.filter((c) => {
      if (c.id === commentId && (c.authorId === userId || userId === 'usr_admin')) {
        return false;
      }
      if (c.replies) {
        c.replies = c.replies.filter((r) => !(r.id === commentId && (r.authorId === userId || userId === 'usr_admin')));
      }
      return true;
    });

    post.commentsCount = post.comments.length + post.comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0);
    this.savePostsToStorage(posts);
    return true;
  }

  async reportContent(report: ContentReport): Promise<boolean> {
    try {
      const reports = JSON.parse(localStorage.getItem(STORAGE_REPORTS_KEY) || '[]');
      reports.push({ ...report, createdAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));

      fetch('/api/community/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      }).catch(() => {});
      return true;
    } catch {
      return false;
    }
  }
}

export const communityService = new CommunityService();
