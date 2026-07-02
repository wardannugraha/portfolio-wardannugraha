"use client";

import { useState, useRef, useEffect } from "react";
import { 
  LayoutDashboard, FileText, Camera, Plus, Trash2, ArrowUpRight, LogOut, 
  CheckCircle, Check, Loader2, User, Sliders, Trophy, Users, Edit2, X, Play,
  Bold, Italic, Link, Image, Video, Heading, List, Quote, AlertCircle,
  ChevronUp, ChevronDown, Menu
} from "lucide-react";
import { parseEmbedUrl } from "@/lib/embedParser";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  content: string | null;
  featuredImage: string;
  demoUrl: string | null;
  githubUrl: string | null;
  links: string | null;
  categoryId: string;
  category: Category;
  isFeatured: boolean;
}

interface Media {
  id: string;
  title: string;
  url: string;
  description: string | null;
  categoryId: string | null;
  category: Category | null;
  isFeatured: boolean;
}

interface Skill {
  id: string;
  name: string;
  level: string | null;
  category: string;
}

interface Achievement {
  id: string;
  title: string;
  issuer: string;
  date: string | Date | null;
  description: string | null;
  image: string | null;
  content: string | null;
  links: string | null;
}

interface CommunityActivity {
  id: string;
  title: string;
  role: string;
  organization: string;
  dateRange: string;
  description: string | null;
  image: string | null;
  content: string | null;
  links: string | null;
}

interface AdminDashboardClientProps {
  initialProjects: Project[];
  initialMedia: Media[];
  categories: Category[];
  initialSkills: Skill[];
  initialAchievements: Achievement[];
  initialCommunity: CommunityActivity[];
  initialAboutMe: string;
  initialAboutName: string;
  initialAboutPhoto: string;
  initialSkillCategories: string;
  initialContactLinks: string;
}

export default function AdminDashboardClient({ 
  initialProjects, 
  initialMedia, 
  categories,
  initialSkills,
  initialAchievements,
  initialCommunity,
  initialAboutMe,
  initialAboutName,
  initialAboutPhoto,
  initialSkillCategories,
  initialContactLinks
}: AdminDashboardClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "projects" | "media" | "about" | "skills" | "achievements" | "community" | "contact">("dashboard");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // File Upload States
  const [uploadingProjImage, setUploadingProjImage] = useState(false);
  const [uploadingMediaUrl, setUploadingMediaUrl] = useState(false);
  const [uploadingContentImage, setUploadingContentImage] = useState(false);

  // Project Form States
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projContent, setProjContent] = useState("");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (insertedText: string) => {
    const textarea = contentRef.current;
    if (!textarea) {
      setProjContent(prev => prev + insertedText);
      return;
    }
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    setProjContent(prev => {
      const beforeText = prev.substring(0, startPos);
      const afterText = prev.substring(endPos, prev.length);
      return beforeText + insertedText + afterText;
    });

    // Keep focus and position cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + insertedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };
  const [projImage, setProjImage] = useState("");
  const [projCatId, setProjCatId] = useState(categories[0]?.id || "");
  const [projDemo, setProjDemo] = useState("");
  const [projGit, setProjGit] = useState("");
  const [projFeatured, setProjFeatured] = useState(false);
  const [projLinks, setProjLinks] = useState<{ label: string; url: string; icon: string }[]>([]);

  // Media Form States
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCoverUrl, setMediaCoverUrl] = useState("");
  const [mediaDesc, setMediaDesc] = useState("");
  const [mediaCatId, setMediaCatId] = useState(categories.find(c => c.slug === "photography")?.id || "");
  const [mediaFeatured, setMediaFeatured] = useState(false);
  const [uploadingMediaCover, setUploadingMediaCover] = useState(false);

  // About Me State
  const [aboutMe, setAboutMe] = useState(initialAboutMe);
  const [aboutName, setAboutName] = useState(initialAboutName);
  const [aboutPhoto, setAboutPhoto] = useState(initialAboutPhoto);

  // Contact Links State
  let parsedContactLinks: { label: string; url: string; icon: string; username?: string }[] = [];
  try {
    parsedContactLinks = JSON.parse(initialContactLinks);
    if (!Array.isArray(parsedContactLinks)) {
      parsedContactLinks = [];
    }
  } catch {
    parsedContactLinks = [];
  }
  const [contactLinks, setContactLinks] = useState<{ label: string; url: string; icon: string; username?: string }[]>(parsedContactLinks);

  const handleSaveContactLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "contact_links", value: JSON.stringify(contactLinks) }),
      });
      if (res.ok) {
        showNotification("Contact & Social links saved successfully!");
      } else {
        alert("Failed to save contact links to database");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving contact links");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveContactLink = (index: number, direction: "up" | "down") => {
    const updated = [...contactLinks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;

    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setContactLinks(updated);
  };
  const [updatingAbout, setUpdatingAbout] = useState(false);
  const [uploadingAboutPhoto, setUploadingAboutPhoto] = useState(false);

  // Skill Form States & Categories
  let parsedSkillCategories: string[] = [];
  try {
    parsedSkillCategories = JSON.parse(initialSkillCategories);
    if (!Array.isArray(parsedSkillCategories) || parsedSkillCategories.length === 0) {
      parsedSkillCategories = ["Technology", "Creative", "Soft Skills", "Languages"];
    }
  } catch {
    parsedSkillCategories = ["Technology", "Creative", "Soft Skills", "Languages"];
  }

  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [customCategories, setCustomCategories] = useState<string[]>(parsedSkillCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState(80);
  const [skillCategory, setSkillCategory] = useState(parsedSkillCategories[0] || "Technology");
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  // Achievement Form States
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [achTitle, setAchTitle] = useState("");
  const [achIssuer, setAchIssuer] = useState("");
  const [achDate, setAchDate] = useState("");
  const [achDesc, setAchDesc] = useState("");
  const [achImage, setAchImage] = useState("");
  const [achContent, setAchContent] = useState("");
  const [achLinks, setAchLinks] = useState<{ label: string; url: string; icon: string }[]>([]);
  const [uploadingAchImage, setUploadingAchImage] = useState(false);
  const achContentRef = useRef<HTMLTextAreaElement>(null);
  const [editingAchId, setEditingAchId] = useState<string | null>(null);

  const insertAtAchCursor = (insertedText: string) => {
    const textarea = achContentRef.current;
    if (!textarea) {
      setAchContent(prev => prev + insertedText);
      return;
    }
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    setAchContent(prev => {
      const beforeText = prev.substring(0, startPos);
      const afterText = prev.substring(endPos, prev.length);
      return beforeText + insertedText + afterText;
    });

    // Keep focus and position cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + insertedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Community Activity Form States
  const [community, setCommunity] = useState<CommunityActivity[]>(initialCommunity);
  const [commTitle, setCommTitle] = useState("");
  const [commRole, setCommRole] = useState("");
  const [commOrg, setCommOrg] = useState("");
  const [commDateRange, setCommDateRange] = useState("");
  const [commDesc, setCommDesc] = useState("");
  const [commImage, setCommImage] = useState("");
  const [commContent, setCommContent] = useState("");
  const [commLinks, setCommLinks] = useState<{ label: string; url: string; icon: string }[]>([]);
  const [uploadingCommImage, setUploadingCommImage] = useState(false);
  const commContentRef = useRef<HTMLTextAreaElement>(null);
  const [editingCommId, setEditingCommId] = useState<string | null>(null);

  const insertAtCommCursor = (insertedText: string) => {
    const textarea = commContentRef.current;
    if (!textarea) {
      setCommContent(prev => prev + insertedText);
      return;
    }
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    setCommContent(prev => {
      const beforeText = prev.substring(0, startPos);
      const afterText = prev.substring(endPos, prev.length);
      return beforeText + insertedText + afterText;
    });

    // Keep focus and position cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + insertedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Modal Edit States
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);

  // Modal Open States (for both Add and Edit)
  const [isProjModalOpen, setIsProjModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isAchModalOpen, setIsAchModalOpen] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  // Asset Picker States
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [onSelectAsset, setOnSelectAsset] = useState<(url: string) => void>(() => () => {});
  const [galleryAssets, setGalleryAssets] = useState<{ url: string; inUse: boolean }[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [hasMoreAssets, setHasMoreAssets] = useState(false);
  const [assetsCursor, setAssetsCursor] = useState<string | null>(null);
  const [assetsOffset, setAssetsOffset] = useState<number>(0);

  const fetchAssets = async (reset: boolean = false) => {
    setIsLoadingAssets(true);
    try {
      const limit = 12;
      const currentOffset = reset ? 0 : assetsOffset;
      const currentCursor = reset ? "" : (assetsCursor || "");
      
      let url = `/api/admin/assets?limit=${limit}`;
      if (currentCursor) {
        url += `&nextCursor=${encodeURIComponent(currentCursor)}`;
      } else {
        url += `&offset=${currentOffset}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        if (reset) {
          setGalleryAssets(data.assets || []);
        } else {
          setGalleryAssets(prev => [...prev, ...(data.assets || [])]);
        }
        setAssetsCursor(data.nextCursor || null);
        setAssetsOffset(reset ? limit : currentOffset + limit);
        setHasMoreAssets(data.hasMore || false);
      } else {
        console.error("Failed to fetch gallery assets:", data.error);
      }
    } catch (err) {
      console.error("Error fetching gallery assets:", err);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  useEffect(() => {
    if (isAssetPickerOpen) {
      fetchAssets(true);
    }
  }, [isAssetPickerOpen]);

  const handleDeleteAsset = (url: string) => {
    askConfirmation("Are you sure you want to permanently delete this photo? This cannot be undone.", async () => {
      try {
        const res = await fetch(`/api/admin/assets?url=${encodeURIComponent(url)}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setGalleryAssets(prev => prev.filter(item => item.url !== url));
          showNotification("Photo deleted successfully!");
        } else {
          alert(data.error || "Failed to delete photo");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred during deletion");
      }
    });
  };

  // Custom Error Toast State
  const [errorMsg, setErrorMsg] = useState("");
  const showErrorNotification = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 5000);
  };

  // Custom Confirmation Modal States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  const askConfirmation = (msg: string, onConfirm: () => void) => {
    setConfirmMessage(msg);
    setConfirmCallback(() => onConfirm);
    setConfirmOpen(true);
  };

  // Shadow native alert popup with our premium custom toast
  const alert = (msg: string) => {
    showErrorNotification(msg);
  };

  // Custom Prompt Modal States
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptTitle, setPromptTitle] = useState("");
  const [promptFields, setPromptFields] = useState<{ name: string; label: string; placeholder: string; required?: boolean }[]>([]);
  const [promptValues, setPromptValues] = useState<Record<string, string>>({});
  const [promptSubmitCallback, setPromptSubmitCallback] = useState<((values: Record<string, string>) => void) | null>(null);

  const openCustomPrompt = (
    title: string,
    fields: { name: string; label: string; placeholder: string; required?: boolean }[],
    onSubmit: (values: Record<string, string>) => void
  ) => {
    setPromptTitle(title);
    setPromptFields(fields);
    const initialVals: Record<string, string> = {};
    fields.forEach(f => {
      initialVals[f.name] = "";
    });
    setPromptValues(initialVals);
    setPromptSubmitCallback(() => onSubmit);
    setPromptOpen(true);
  };

  // Form resets
  const resetProjectForm = () => {
    setProjTitle("");
    setProjDesc("");
    setProjContent("");
    setProjImage("");
    setProjDemo("");
    setProjGit("");
    setProjFeatured(false);
    setProjLinks([]);
    setProjCatId(categories[0]?.id || "");
  };

  const resetMediaForm = () => {
    setMediaTitle("");
    setMediaUrl("");
    setMediaCoverUrl("");
    setMediaDesc("");
    setMediaFeatured(false);
    setMediaCatId(categories.find(c => c.slug === "photography")?.id || "");
  };

  const resetSkillForm = () => {
    setSkillName("");
    setSkillLevel(80);
    setSkillCategory(customCategories[0] || "");
    setEditingSkillId(null);
  };

  const resetAchForm = () => {
    setAchTitle("");
    setAchIssuer("");
    setAchDate("");
    setAchDesc("");
    setAchImage("");
    setAchContent("");
    setAchLinks([]);
    setEditingAchId(null);
  };

  const resetCommForm = () => {
    setCommTitle("");
    setCommRole("");
    setCommOrg("");
    setCommDateRange("");
    setCommDesc("");
    setCommImage("");
    setCommContent("");
    setCommLinks([]);
    setEditingCommId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "project" | "media" | "about" | "content" | "mediaCover" | "achievement" | "achContent" | "community" | "commContent") => {
    const inputEl = e.target;
    const files = inputEl.files;
    if (!files || files.length === 0) return;

    if (target === "project") setUploadingProjImage(true);
    else if (target === "about") setUploadingAboutPhoto(true);
    else if (target === "content") setUploadingContentImage(true);
    else if (target === "achContent") setUploadingContentImage(true);
    else if (target === "commContent") setUploadingContentImage(true);
    else if (target === "achievement") setUploadingAchImage(true);
    else if (target === "community") setUploadingCommImage(true);
    else if (target === "mediaCover") setUploadingMediaCover(true);
    else setUploadingMediaUrl(true);

    try {
      const isMultiTarget = target === "content" || target === "achContent" || target === "commContent";
      const filesToUpload = isMultiTarget ? Array.from(files) : [files[0]];
      let uploadSuccessCount = 0;

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/admin/upload?target=${target}`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success) {
          uploadSuccessCount++;
          if (target === "project") {
            setProjImage(data.url);
          } else if (target === "about") {
            setAboutPhoto(data.url);
          } else if (target === "content") {
            insertAtCursor(`\n![Image](${data.url})\n`);
          } else if (target === "achContent") {
            insertAtAchCursor(`\n![Image](${data.url})\n`);
          } else if (target === "commContent") {
            insertAtCommCursor(`\n![Image](${data.url})\n`);
          } else if (target === "achievement") {
            setAchImage(data.url);
          } else if (target === "community") {
            setCommImage(data.url);
          } else if (target === "mediaCover") {
            setMediaCoverUrl(data.url);
          } else {
            setMediaUrl(data.url);
          }
        } else {
          alert(`${file.name} upload failed: ${data.error || "Unknown error"}`);
        }
      }

      if (uploadSuccessCount > 0) {
        showNotification(`${uploadSuccessCount} image(s) uploaded and inserted successfully!`);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      // Clear file input value to allow re-uploading the same file
      if (inputEl) {
        inputEl.value = "";
      }

      if (target === "project") setUploadingProjImage(false);
      else if (target === "about") setUploadingAboutPhoto(false);
      else if (target === "content") setUploadingContentImage(false);
      else if (target === "achContent") setUploadingContentImage(false);
      else if (target === "commContent") setUploadingContentImage(false);
      else if (target === "achievement") setUploadingAchImage(false);
      else if (target === "community") setUploadingCommImage(false);
      else if (target === "mediaCover") setUploadingMediaCover(false);
      else setUploadingMediaUrl(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const githubLink = projLinks.find(l => l.icon === "github" || l.url.includes("github.com"));
      const demoLink = projLinks.find(l => l.icon === "link" || (!githubLink && l.icon !== "github"));
      const computedGithub = projLinks.length > 0 ? (githubLink ? githubLink.url : null) : (projGit || null);
      const computedDemo = projLinks.length > 0 ? (demoLink ? demoLink.url : (projLinks[0]?.url || null)) : (projDemo || null);

      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProjId,
          title: projTitle,
          description: projDesc,
          content: projContent || null,
          featuredImage: projImage || "/uploads/default.jpg",
          demoUrl: computedDemo,
          githubUrl: computedGithub,
          links: projLinks.length > 0 ? JSON.stringify(projLinks) : null,
          categoryId: projCatId,
          isFeatured: projFeatured,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Find category object
        const catObj = categories.find(c => c.id === projCatId);
        const updatedProj: Project = {
          ...data.data,
          category: catObj || { id: projCatId, name: "Uncategorized", slug: "uncat" },
        };
        
        if (editingProjId) {
          setProjects(projects.map(p => p.id === editingProjId ? updatedProj : p));
          showNotification("Project updated successfully!");
          setEditingProjId(null);
        } else {
          setProjects([updatedProj, ...projects]);
          showNotification("Project added successfully!");
        }
        
        resetProjectForm();
        setIsProjModalOpen(false);
      } else {
        alert(data.error || "Failed to save project");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = (id: string) => {
    askConfirmation("Are you sure you want to delete this project?", async () => {
      try {
        const res = await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok && data.success) {
          setProjects(projects.filter(p => p.id !== id));
          showNotification("Project deleted successfully!");
        } else {
          alert(data.error || "Failed to delete project");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred");
      }
    });
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalUrl = mediaCoverUrl ? `${mediaUrl}||${mediaCoverUrl}` : mediaUrl;
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMediaId,
          title: mediaTitle,
          url: finalUrl,
          description: mediaDesc || null,
          categoryId: mediaCatId || null,
          isFeatured: mediaFeatured,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const catObj = categories.find(c => c.id === mediaCatId);
        const updatedMedia: Media = {
          ...data.data,
          category: catObj || null,
        };
        
        if (editingMediaId) {
          setMedia(media.map(m => m.id === editingMediaId ? updatedMedia : m));
          showNotification("Media item updated successfully!");
          setEditingMediaId(null);
        } else {
          setMedia([updatedMedia, ...media]);
          showNotification("Media item added successfully!");
        }

        resetMediaForm();
        setIsMediaModalOpen(false);
      } else {
        alert(data.error || "Failed to save media item");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = (id: string) => {
    askConfirmation("Are you sure you want to delete this media item?", async () => {
      try {
        const res = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok && data.success) {
          setMedia(media.filter(m => m.id !== id));
          showNotification("Media item deleted successfully!");
        } else {
          alert(data.error || "Failed to delete media item");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred");
      }
    });
  };

  const handleUpdateAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingAbout(true);
    try {
      const saveSettings = [
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "about_me", value: aboutMe }),
        }),
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "about_name", value: aboutName }),
        }),
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "about_photo", value: aboutPhoto }),
        }),
      ];
      
      const results = await Promise.all(saveSettings);
      const allOk = results.every(res => res.ok);
      if (allOk) {
        showNotification("About settings updated successfully!");
      } else {
        alert("Failed to update some settings");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setUpdatingAbout(false);
    }
  };

  const handleSaveCategories = async (updatedCategories: string[]) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "skill_categories", value: JSON.stringify(updatedCategories) }),
      });
      if (res.ok) {
        setCustomCategories(updatedCategories);
        showNotification("Skill categories saved!");
      } else {
        alert("Failed to save categories to database");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving categories");
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) return;
    if (customCategories.includes(cleanName)) {
      alert("Category already exists!");
      return;
    }
    const updated = [...customCategories, cleanName];
    handleSaveCategories(updated);
    setNewCategoryName("");
  };

  const handleDeleteCategory = (catName: string) => {
    askConfirmation(`Are you sure you want to delete category "${catName}"? Skills belonging to this category won't be deleted but will be hidden from the dynamic filter until their category is updated.`, () => {
      const updated = customCategories.filter(c => c !== catName);
      handleSaveCategories(updated);
    });
  };

  const handleMoveCategory = (index: number, direction: "up" | "down") => {
    const updated = [...customCategories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    
    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    handleSaveCategories(updated);
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSkillId,
          name: skillName,
          level: String(skillLevel),
          category: skillCategory,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (editingSkillId) {
          setSkills(skills.map(s => s.id === editingSkillId ? data.data : s));
          showNotification("Skill updated successfully!");
        } else {
          setSkills([data.data, ...skills]);
          showNotification("Skill added successfully!");
        }
        resetSkillForm();
        setIsSkillModalOpen(false);
      } else {
        alert(data.error || "Failed to save skill");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = (id: string) => {
    askConfirmation("Are you sure you want to delete this skill?", async () => {
      try {
        const res = await fetch(`/api/admin/skills?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok && data.success) {
          setSkills(skills.filter(s => s.id !== id));
          showNotification("Skill deleted successfully!");
          if (editingSkillId === id) {
            setSkillName("");
            setSkillLevel(80);
            setEditingSkillId(null);
          }
        } else {
          alert(data.error || "Failed to delete skill");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred");
      }
    });
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAchId,
          title: achTitle,
          issuer: achIssuer,
          date: achDate || null,
          description: achDesc,
          image: achImage || null,
          content: achContent || null,
          links: achLinks.length > 0 ? JSON.stringify(achLinks) : null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (editingAchId) {
          setAchievements(achievements.map(a => a.id === editingAchId ? data.data : a));
          showNotification("Achievement/Cert updated successfully!");
        } else {
          setAchievements([data.data, ...achievements]);
          showNotification("Achievement/Cert added successfully!");
        }
        resetAchForm();
        setIsAchModalOpen(false);
      } else {
        alert(data.error || "Failed to save achievement");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAchievement = (id: string) => {
    askConfirmation("Are you sure you want to delete this certification?", async () => {
      try {
        const res = await fetch(`/api/admin/achievements?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok && data.success) {
          setAchievements(achievements.filter(a => a.id !== id));
          showNotification("Certification deleted successfully!");
          if (editingAchId === id) {
            setAchTitle("");
            setAchIssuer("");
            setAchDate("");
            setAchDesc("");
            setEditingAchId(null);
          }
        } else {
          alert(data.error || "Failed to delete certification");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred");
      }
    });
  };

  const handleAddCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCommId,
          title: commTitle,
          role: commRole,
          organization: commOrg,
          dateRange: commDateRange,
          description: commDesc,
          image: commImage || null,
          content: commContent || null,
          links: commLinks.length > 0 ? JSON.stringify(commLinks) : null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (editingCommId) {
          setCommunity(community.map(c => c.id === editingCommId ? data.data : c));
          showNotification("Community Activity updated successfully!");
        } else {
          setCommunity([data.data, ...community]);
          showNotification("Community Activity added successfully!");
        }
        resetCommForm();
        setIsCommModalOpen(false);
      } else {
        alert(data.error || "Failed to save activity");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCommunity = (id: string) => {
    askConfirmation("Are you sure you want to delete this activity?", async () => {
      try {
        const res = await fetch(`/api/admin/community?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok && data.success) {
          setCommunity(community.filter(c => c.id !== id));
          showNotification("Activity deleted successfully!");
          if (editingCommId === id) {
            setCommTitle("");
            setCommRole("");
            setCommOrg("");
            setCommDateRange("");
            setCommDesc("");
            setCommImage("");
            setCommContent("");
            setCommLinks([]);
            setEditingCommId(null);
          }
        } else {
          alert(data.error || "Failed to delete activity");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred");
      }
    });
  };



  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex flex-col md:flex-row pt-16">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-500 text-black font-semibold py-3 px-5 rounded-xl flex items-center gap-2 shadow-2xl transition-all duration-300">
          <Check className="w-5 h-5 stroke-[3]" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-red-500 text-white font-semibold py-3 px-5 rounded-xl flex items-center gap-2 shadow-2xl transition-all duration-300">
          <AlertCircle className="w-5 h-5 stroke-[2]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Sidebar Drawer Backdrop (Mobile Only) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-x-0 bottom-0 top-16 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Mobile Top Header */}
      <div className="w-full md:hidden flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#030303]/90 backdrop-blur-md sticky top-16 z-30">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-semibold text-white">Admin Console</span>
        </div>
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          Menu
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-16 md:inset-y-auto left-0 z-50
        w-64 h-[calc(100vh-4rem)] md:h-auto 
        bg-[#090909] md:bg-transparent
        border-r border-white/5 md:border-r md:border-b-0
        p-6 flex flex-col justify-between
        transition-transform duration-300 md:transition-none
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="space-y-8">
          <div className="flex items-center justify-between md:block">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Workspace</h2>
              <p className="text-sm font-semibold text-white mt-1">Admin Console</p>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <nav className="space-y-1">
            {[
              { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
              { id: "about", name: "About Me Dynamic", icon: User },
              { id: "skills", name: "Skills CRUD", icon: Sliders },
              { id: "projects", name: "Projects CRUD", icon: FileText },
              { id: "media", name: "Media CRUD", icon: Camera },
              { id: "achievements", name: "Credentials CRUD", icon: Trophy },
              { id: "community", name: "Community CRUD", icon: Users },
              { id: "contact", name: "Contact & Social CRUD", icon: Link },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-h-screen">
        {activeTab === "dashboard" && (
          <>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard Overview</h1>
              <p className="text-zinc-400 text-sm mt-1">Quick statistics and management controls</p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Core Projects</span>
                <p className="text-3xl font-extrabold text-white mt-2">{projects.length}</p>
                <p className="text-xs text-zinc-400 mt-1">Builder items in DB</p>
              </div>

              <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Photography Media</span>
                <p className="text-3xl font-extrabold text-white mt-2">{media.length}</p>
                <p className="text-xs text-zinc-400 mt-1">Creator items in DB</p>
              </div>

              <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Expertise Skills</span>
                <p className="text-3xl font-extrabold text-white mt-2">{skills.length}</p>
                <p className="text-xs text-zinc-400 mt-1">Interactive skills stored</p>
              </div>

              <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Credentials & Prestasi</span>
                <p className="text-3xl font-extrabold text-white mt-2">{achievements.length}</p>
                <p className="text-xs text-zinc-400 mt-1">Certifications & Awards</p>
              </div>
            </div>

            {/* Admin Notifications / Info Panel */}
            <div className="glass-card rounded-3xl p-8 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-4">Database Log & Systems</h2>
              <div className="divide-y divide-white/5">
                {[
                  { title: "Dynamic category sorting enabled", status: "Active UI Layer", color: "text-emerald-400" },
                  { title: "Connected to Neon PostgreSQL project", status: "Active PostgreSQL", color: "text-emerald-400" },
                  { title: "Authentication cookie expiration", status: "24 Hours Secure", color: "text-violet-400" },
                ].map((act, i) => (
                  <div key={i} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-semibold text-white">{act.title}</h3>
                        <p className="text-zinc-500 text-xs mt-0.5">Automated console notification</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold ${act.color}`}>{act.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "projects" && (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Projects</h1>
                <p className="text-zinc-400 text-sm mt-1">Add, update, and delete Builder category entries</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetProjectForm();
                  setEditingProjId(null);
                  setIsProjModalOpen(true);
                }}
                className="px-5 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>

            {/* List of current projects */}
            <div className="glass-card rounded-3xl p-6 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-6">Current Projects ({projects.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase font-semibold">
                      <th className="py-3 px-4">Image</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {projects.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <a
                            href={p.featuredImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-12 h-8 rounded bg-zinc-950 border border-white/5 overflow-hidden flex-shrink-0 relative group/thumb"
                            title="Click to view full image"
                          >
                            <img
                              src={getThumbnailUrl(p.featuredImage)}
                              alt={p.title}
                              className="object-cover w-full h-full group-hover/thumb:scale-110 transition-transform duration-200"
                            />
                          </a>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">{p.title}</td>
                        <td className="py-3 px-4 text-zinc-400">{p.category.name}</td>
                        <td className="py-3 px-4">
                          {p.isFeatured ? (
                            <span className="text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-0.5 px-2 rounded-full">Yes</span>
                          ) : (
                            <span className="text-[10px] font-semibold bg-zinc-500/10 border border-white/5 text-zinc-500 py-0.5 px-2 rounded-full">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                             onClick={() => {
                              setEditingProjId(p.id);
                              setProjTitle(p.title);
                              setProjDesc(p.description);
                              setProjContent(p.content || "");
                              setProjImage(p.featuredImage);
                              setProjCatId(p.categoryId);
                              setProjDemo(p.demoUrl || "");
                              setProjGit(p.githubUrl || "");
                              setProjFeatured(p.isFeatured);

                              let linksArr = [];
                              if (p.links) {
                                try {
                                  linksArr = JSON.parse(p.links);
                                } catch (e) {
                                  console.error("Failed to parse project links:", e);
                                }
                              }
                              if (linksArr.length === 0) {
                                if (p.demoUrl) linksArr.push({ label: "Visit Live Demo", url: p.demoUrl, icon: "link" });
                                if (p.githubUrl) linksArr.push({ label: "Source Code", url: p.githubUrl, icon: "github" });
                              }
                              setProjLinks(linksArr);
                              
                              setIsProjModalOpen(true);
                            }}
                            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(p.id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Project Add/Edit Modal */}
            <AdminEditModal
              isOpen={isProjModalOpen}
              onClose={() => {
                setIsProjModalOpen(false);
                setEditingProjId(null);
                resetProjectForm();
              }}
              title={editingProjId ? "Edit Project" : "Add New Project"}
              maxWidthClass="max-w-5xl"
            >
              <form onSubmit={handleAddProject} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Title *</label>
                    <input
                      type="text" required value={projTitle} onChange={e => setProjTitle(e.target.value)}
                      placeholder="E-Commerce System"
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Description *</label>
                    <textarea
                      required rows={3} value={projDesc} onChange={e => setProjDesc(e.target.value)}
                      placeholder="A short summary of the project to show in the cards"
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Detailed Content</label>
                      <div className="flex gap-3">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer">
                          {uploadingContentImage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          <span>Upload & Insert</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "content")}
                            disabled={uploadingContentImage}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOnSelectAsset(() => (url: string) => {
                              insertAtCursor(`\n![Image](${url})\n`);
                            });
                            setIsAssetPickerOpen(true);
                          }}
                          className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Pilih Galeri</span>
                        </button>
                      </div>
                    </div>

                    {/* Markdown Editor Toolbar */}
                    <div className="flex flex-wrap gap-1 p-1.5 bg-white/5 border border-white/10 rounded-t-xl">
                      <button
                        type="button"
                        onClick={() => {
                          openCustomPrompt(
                            "Insert Image Link",
                            [
                              { name: "url", label: "Image URL *", placeholder: "https://example.com/image.jpg", required: true },
                              { name: "alt", label: "Description (Alt Text) - Optional", placeholder: "e.g. Project screenshot" }
                            ],
                            (values) => {
                              const altText = values.alt || "Image";
                              insertAtCursor(`![${altText}](${values.url})`);
                            }
                          );
                        }}
                        className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        title="Insert Image Link"
                      >
                        <Image className="w-3 h-3" />
                        <span className="hidden sm:inline">Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          openCustomPrompt(
                            "Insert Video or Figma Embed",
                            [
                              { name: "url", label: "Embed URL (YouTube, Vimeo, Figma, etc.) *", placeholder: "https://youtube.com/watch?v=...", required: true },
                              { name: "title", label: "Media Title - Optional", placeholder: "e.g. Project Demo Video" }
                            ],
                            (values) => {
                              const mediaTitle = values.title || "Embed Media";
                              insertAtCursor(`![${mediaTitle}](${values.url})`);
                            }
                          );
                        }}
                        className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        title="Insert Video or Figma Embed"
                      >
                        <Video className="w-3 h-3" />
                        <span className="hidden sm:inline">Embed</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          openCustomPrompt(
                            "Insert Text Link",
                            [
                              { name: "url", label: "Link URL *", placeholder: "https://example.com", required: true },
                              { name: "text", label: "Link Text *", placeholder: "e.g. Visit Website", required: true }
                            ],
                            (values) => {
                              insertAtCursor(`[${values.text}](${values.url})`);
                            }
                          );
                        }}
                        className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        title="Insert Text Link"
                      >
                        <Link className="w-3 h-3" />
                        <span className="hidden sm:inline">Link</span>
                      </button>

                      <div className="w-px h-4 bg-white/10 mx-1 align-self-center" />

                      <button
                        type="button"
                        onClick={() => {
                          const textarea = contentRef.current;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selected = projContent.substring(start, end);
                            if (selected) {
                              insertAtCursor(`**${selected}**`);
                            } else {
                              insertAtCursor(`**Bold Text**`);
                            }
                          } else {
                            insertAtCursor(`**Bold Text**`);
                          }
                        }}
                        className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center font-bold"
                        title="Bold text"
                      >
                        <Bold className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const textarea = contentRef.current;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selected = projContent.substring(start, end);
                            if (selected) {
                              insertAtCursor(`*${selected}*`);
                            } else {
                              insertAtCursor(`*Italic Text*`);
                            }
                          } else {
                            insertAtCursor(`*Italic Text*`);
                          }
                        }}
                        className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center italic"
                        title="Italic text"
                      >
                        <Italic className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          insertAtCursor(`\n### `);
                        }}
                        className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center font-bold"
                        title="Heading 3"
                      >
                        <Heading className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          insertAtCursor(`\n- `);
                        }}
                        className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center"
                        title="Bullet List"
                      >
                        <List className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          insertAtCursor(`\n> `);
                        }}
                        className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center"
                        title="Quote"
                      >
                        <Quote className="w-3 h-3" />
                      </button>
                    </div>

                    <textarea
                      ref={contentRef}
                      rows={8} value={projContent} onChange={e => setProjContent(e.target.value)}
                      placeholder="Case study or full markdown content..."
                      className="w-full px-5 py-3.5 rounded-b-xl bg-white/5 border border-white/10 border-t-0 focus:border-violet-500 outline-none text-white text-sm transition-all duration-200 resize-y"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Image Field with file upload selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Featured Image *</label>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text" required value={projImage} onChange={e => setProjImage(e.target.value)}
                        placeholder="/uploads/project1.jpg or external https:// url"
                        className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                      />
                      <div className="flex gap-2">
                        <label className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors duration-250 border border-white/5">
                          {uploadingProjImage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-white" />
                          )}
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "project")}
                            disabled={uploadingProjImage}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOnSelectAsset(() => (url: string) => setProjImage(url));
                            setIsAssetPickerOpen(true);
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs tracking-wider uppercase border border-white/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Pilih Galeri</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Category *</label>
                    <select
                      value={projCatId} onChange={e => setProjCatId(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-[#0f0f0f] text-white">{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <input
                      type="checkbox" id="projFeaturedEdit" checked={projFeatured} onChange={e => setProjFeatured(e.target.checked)}
                      className="w-5 h-5 rounded accent-violet-600 bg-white/5 border border-white/10 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="projFeaturedEdit" className="text-sm font-semibold text-zinc-300 select-none cursor-pointer">
                      Featured Project (Highlight on homepage)
                    </label>
                  </div>
                </div>

                {/* Project Action Links Builder */}
                <div className="lg:col-span-2 space-y-4 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Project Action Links ({projLinks.length})</label>
                    <button
                      type="button"
                      onClick={() => setProjLinks([...projLinks, { label: "", url: "", icon: "link" }])}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Link
                    </button>
                  </div>

                  {projLinks.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-2">No links added yet. Tautan live demo, instagram, figma, atau file jurnal bisa ditambahkan di sini.</p>
                  ) : (
                    <div className="space-y-4">
                      {projLinks.map((link, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              required
                              placeholder="Label (e.g. Desain Figma, Link Jurnal)"
                              value={link.label}
                              onChange={(e) => {
                                const updated = [...projLinks];
                                updated[idx].label = e.target.value;
                                setProjLinks(updated);
                              }}
                              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                            />
                          </div>
                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              required
                              placeholder="URL (https://...)"
                              value={link.url}
                              onChange={(e) => {
                                const updated = [...projLinks];
                                updated[idx].url = e.target.value;
                                // Auto detect icon on URL change if it's currently default 'link'
                                if (link.icon === "link") {
                                  const val = e.target.value.toLowerCase();
                                  if (val.includes("github.com")) updated[idx].icon = "github";
                                  else if (val.includes("instagram.com")) updated[idx].icon = "camera";
                                  else if (val.includes("youtube.com") || val.includes("youtu.be") || val.includes("vimeo.com")) updated[idx].icon = "video";
                                  else if (val.endsWith(".pdf") || val.includes("drive.google.com") || val.includes("jurnal") || val.includes("journal") || val.includes("paper")) updated[idx].icon = "file";
                                }
                                setProjLinks(updated);
                              }}
                              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                            />
                          </div>
                          <div className="w-full sm:w-auto">
                            <select
                              value={link.icon}
                              onChange={(e) => {
                                const updated = [...projLinks];
                                updated[idx].icon = e.target.value;
                                setProjLinks(updated);
                              }}
                              className="w-full sm:w-36 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                            >
                              <option value="link" className="bg-[#0f0f0f] text-white">🌐 Link (Default)</option>
                              <option value="github" className="bg-[#0f0f0f] text-white">💻 GitHub</option>
                              <option value="camera" className="bg-[#0f0f0f] text-white">📸 Galeri Foto</option>
                              <option value="video" className="bg-[#0f0f0f] text-white">🎥 Video Reel</option>
                              <option value="file" className="bg-[#0f0f0f] text-white">📄 Dokumen / Jurnal</option>
                              <option value="layout" className="bg-[#0f0f0f] text-white">🎨 Desain / UI/UX</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setProjLinks(projLinks.filter((_, i) => i !== idx));
                            }}
                            className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl cursor-pointer transition-colors flex-shrink-0"
                            title="Delete Link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit button (Full Width) */}
                <div className="lg:col-span-2 pt-6 border-t border-white/10">
                  <button
                    type="submit" disabled={loading}
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProjId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingProjId ? "Save Changes" : "Create Project"}
                  </button>
                </div>
              </form>
            </AdminEditModal>
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Creative Media</h1>
                <p className="text-zinc-400 text-sm mt-1">Add, update, and delete Creator category media items (Photos, Videos, Designs)</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetMediaForm();
                  setEditingMediaId(null);
                  setIsMediaModalOpen(true);
                }}
                className="px-5 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Media
              </button>
            </div>

            {/* Media list */}
            <div className="glass-card rounded-3xl p-6 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-6">Current Media Items ({media.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase font-semibold">
                      <th className="py-3 px-4">Preview</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">URL Preview</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {media.map((m) => {
                      const [vUrl, cUrl] = m.url.split("||");
                      const embedInfo = parseEmbedUrl(vUrl);
                      const isVideo = m.category?.slug === "video-editing" || embedInfo.type === "youtube" || embedInfo.type === "vimeo" || embedInfo.type === "instagram" || embedInfo.type === "tiktok";
                      const thumbSrc = cUrl || embedInfo.thumbnailUrl || vUrl;

                      return (
                        <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4">
                            <a
                              href={vUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-12 h-8 rounded bg-zinc-950 border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center relative group/thumb"
                              title={isVideo ? "Click to watch video" : "Click to view media"}
                            >
                              {isVideo ? (
                                thumbSrc && thumbSrc !== vUrl ? (
                                  <>
                                    <img
                                      src={getThumbnailUrl(thumbSrc)}
                                      alt={m.title}
                                      className="object-cover w-full h-full group-hover/thumb:scale-110 transition-transform duration-200"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                      <Play className="w-3 h-3 text-white fill-white" />
                                    </div>
                                  </>
                                ) : (
                                  <Play className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400 group-hover/thumb:scale-110 transition-transform duration-200" />
                                )
                              ) : (
                                <img
                                  src={getThumbnailUrl(thumbSrc)}
                                  alt={m.title}
                                  className="object-cover w-full h-full group-hover/thumb:scale-110 transition-transform duration-200"
                                />
                              )}
                            </a>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">{m.title}</td>
                          <td className="py-3 px-4 text-zinc-400 font-semibold">{m.category?.name || "Uncategorized"}</td>
                          <td className="py-3 px-4">
                            <a
                              href={vUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-violet-400 hover:underline inline-flex items-center gap-1 max-w-[200px] truncate"
                            >
                              {vUrl} <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </td>
                          <td className="py-3 px-4">
                            {m.isFeatured ? (
                              <span className="text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-0.5 px-2 rounded-full">Yes</span>
                            ) : (
                              <span className="text-[10px] font-semibold bg-zinc-500/10 border border-white/5 text-zinc-500 py-0.5 px-2 rounded-full">No</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingMediaId(m.id);
                                setMediaTitle(m.title);
                                setMediaUrl(vUrl || "");
                                setMediaCoverUrl(cUrl || "");
                                setMediaDesc(m.description || "");
                                setMediaCatId(m.categoryId || "");
                                setMediaFeatured(m.isFeatured);
                                setIsMediaModalOpen(true);
                              }}
                              className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          <button
                            onClick={() => handleDeleteMedia(m.id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Media Add/Edit Modal */}
            <AdminEditModal
              isOpen={isMediaModalOpen}
              onClose={() => {
                setIsMediaModalOpen(false);
                setEditingMediaId(null);
                resetMediaForm();
              }}
              title={editingMediaId ? "Edit Media Item" : "Add New Media Item"}
              maxWidthClass="max-w-4xl"
            >
              <form onSubmit={handleAddMedia} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Title *</label>
                    <input
                      type="text" required value={mediaTitle} onChange={e => setMediaTitle(e.target.value)}
                      placeholder="Cinematic Drone Reel or Event Poster"
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Media File (Image/Video) *</label>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text" required value={mediaUrl} onChange={e => setMediaUrl(e.target.value)}
                        placeholder="https://... or click upload"
                        className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                      />
                      <div className="flex gap-2">
                        <label className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors duration-250 border border-white/5">
                          {uploadingMediaUrl ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-white" />
                          )}
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "media")}
                            disabled={uploadingMediaUrl}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOnSelectAsset(() => (url: string) => setMediaUrl(url));
                            setIsAssetPickerOpen(true);
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs tracking-wider uppercase border border-white/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Pilih Galeri</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Cover Image / Thumbnail (Optional for YouTube/IG/Vimeo/Figma/TikTok)</label>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text" value={mediaCoverUrl} onChange={e => setMediaCoverUrl(e.target.value)}
                        placeholder="/uploads/cover.jpg or external thumbnail URL"
                        className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                      />
                      <div className="flex gap-2">
                        <label className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors duration-250 border border-white/5">
                          {uploadingMediaCover ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-white" />
                          )}
                          <span>Upload Cover</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "mediaCover")}
                            disabled={uploadingMediaCover}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOnSelectAsset(() => (url: string) => setMediaCoverUrl(url));
                            setIsAssetPickerOpen(true);
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs tracking-wider uppercase border border-white/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Pilih Galeri</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Category *</label>
                      <select
                        value={mediaCatId} onChange={e => setMediaCatId(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                      >
                        {categories.filter(c => ["photography", "video-editing", "graphic-design"].includes(c.slug)).map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-[#0f0f0f] text-white">{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Short Description</label>
                      <input
                        type="text" value={mediaDesc} onChange={e => setMediaDesc(e.target.value)}
                        placeholder="Moody event shot or drone edit description"
                        className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <input
                      type="checkbox" id="mediaFeaturedEdit" checked={mediaFeatured} onChange={e => setMediaFeatured(e.target.checked)}
                      className="w-5 h-5 rounded accent-violet-600 bg-white/5 border border-white/10 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="mediaFeaturedEdit" className="text-sm font-semibold text-zinc-300 select-none cursor-pointer">
                      Featured (Highlight in Creative Gallery)
                    </label>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full mt-4 py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingMediaId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingMediaId ? "Save Changes" : "Create Media Entry"}
                  </button>
                </div>
              </form>
            </AdminEditModal>
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Profile & Bio</h1>
                <p className="text-zinc-400 text-sm mt-1">View and manage your personal brand profile card</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingAbout(true)}
                className="px-5 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            {/* Premium Profile Card */}
            <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              {/* Profile Banner */}
              <div className="h-32 sm:h-40 bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-fuchsia-900/40 relative border-b border-white/5">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
              </div>
              
              {/* Profile details */}
              <div className="px-6 pb-8 sm:px-8 relative flex flex-col sm:flex-row sm:items-end gap-6">
                {/* Profile Photo as Avatar */}
                <div className="relative -mt-16 sm:-mt-20 w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-[#030303] bg-zinc-900 shadow-2xl flex-shrink-0">
                  <img
                    src={aboutPhoto || "/uploads/default.jpg"}
                    alt={aboutName}
                    className="object-cover w-full h-full"
                  />
                </div>
                
                {/* Name & Bio section */}
                <div className="flex-1 space-y-2 pt-2 sm:pt-0">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{aboutName}</h2>
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Dynamic About Me Bio</p>
                </div>
              </div>

              {/* Bio Narrative Block */}
              <div className="px-6 pb-8 sm:px-8 pt-4 border-t border-white/5 bg-white/[0.01]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">About Narrative</h3>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {aboutMe || "No bio description set yet. Click Edit Profile to add one."}
                </p>
              </div>
            </div>

            {/* About Profile Edit Modal */}
            <AdminEditModal
              isOpen={isEditingAbout}
              onClose={() => setIsEditingAbout(false)}
              title="Edit Profile"
            >
              <form onSubmit={async (e) => {
                await handleUpdateAbout(e);
                setIsEditingAbout(false);
              }} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text" required value={aboutName} onChange={e => setAboutName(e.target.value)}
                    placeholder="Wardan Nugraha Ahmad"
                    className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Profile Photo *
                  </label>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text" required value={aboutPhoto} onChange={e => setAboutPhoto(e.target.value)}
                      placeholder="/uploads/portrait.jpg or external https:// url"
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    />
                    <div className="flex gap-2">
                      <label className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors duration-250 border border-white/5">
                        {uploadingAboutPhoto ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-white" />
                        )}
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "about")}
                          disabled={uploadingAboutPhoto}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOnSelectAsset(() => (url: string) => setAboutPhoto(url));
                          setIsAssetPickerOpen(true);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs tracking-wider uppercase border border-white/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Pilih Galeri</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Bio Description *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    placeholder="Enter your personal brand narrative..."
                    className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm leading-relaxed transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingAbout}
                  className="w-full py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {updatingAbout ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save Profile Settings
                </button>
              </form>
            </AdminEditModal>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Expertise Skills</h1>
                <p className="text-zinc-400 text-sm mt-1">Create, update and remove visual rating indicators for your tech & soft skills</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetSkillForm();
                  setEditingSkillId(null);
                  setIsSkillModalOpen(true);
                }}
                className="px-5 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </div>
 
            {/* Collapsible Categories Ordering */}
            <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsCatManagerOpen(!isCatManagerOpen)}
                className="w-full flex items-center justify-between p-6 text-left text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.01] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-violet-400" />
                  Manage Skill Categories & Ordering
                </span>
                <span className="text-zinc-500 text-xs">{isCatManagerOpen ? "▲ Hide Manager" : "▼ Expand Manager"}</span>
              </button>
              {isCatManagerOpen && (
                <div className="p-6 border-t border-white/5 bg-zinc-950/40">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Category Order (Left-to-Right layout)</span>
                  <div className="divide-y divide-white/5">
                    {customCategories.map((catName, index) => (
                      <div key={catName} className="py-2.5 flex items-center justify-between text-sm">
                        <span className="font-semibold text-white">{catName}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveCategory(index, "up")}
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer text-xs"
                            title="Move Left"
                          >
                            ← Move Left
                          </button>
                          <button
                            type="button"
                            disabled={index === customCategories.length - 1}
                            onClick={() => handleMoveCategory(index, "down")}
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer text-xs"
                            title="Move Right"
                          >
                            Move Right →
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(catName)}
                            className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 cursor-pointer ml-2 text-xs"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
 
            {/* Skills Table List */}
            <div className="glass-card rounded-3xl p-6 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-6">Current Skills ({skills.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase font-semibold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Rating Visual</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {skills.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                        <td className="py-3 px-4 text-zinc-400">{s.category}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-white/5 h-2 rounded-full overflow-hidden">
                              <div className="bg-violet-500 h-full" style={{ width: `${s.level || 50}%` }} />
                            </div>
                            <span className="text-xs text-zinc-400 font-semibold">{s.level || "50"}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingSkillId(s.id);
                              setSkillName(s.name);
                              setSkillLevel(Number(s.level) || 80);
                              setSkillCategory(s.category);
                              setIsSkillModalOpen(true);
                            }}
                            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(s.id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Skill Add/Edit Modal */}
            <AdminEditModal
              isOpen={isSkillModalOpen}
              onClose={() => {
                setIsSkillModalOpen(false);
                setEditingSkillId(null);
                resetSkillForm();
              }}
              title={editingSkillId ? "Edit Skill" : "Add New Skill"}
            >
              <form onSubmit={handleAddSkill} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Skill Name *</label>
                    <input
                      type="text" required value={skillName} onChange={e => setSkillName(e.target.value)}
                      placeholder="React.js, Public Speaking, English, etc."
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Category *</label>
                    <select
                      value={skillCategory} onChange={e => setSkillCategory(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    >
                      {customCategories.map(cat => (
                        <option key={cat} value={cat} className="bg-[#0f0f0f] text-white">{cat}</option>
                      ))}
                      <option value="__ADD_NEW__" className="bg-[#0f0f0f] text-white">+ Add New Category...</option>
                    </select>

                    {skillCategory === "__ADD_NEW__" && (
                      <div className="mt-4 flex gap-2">
                        <input
                          type="text"
                          placeholder="New category name..."
                          value={newCategoryName}
                          onChange={e => setNewCategoryName(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const cleanName = newCategoryName.trim();
                            if (!cleanName) return;
                            if (customCategories.includes(cleanName)) {
                              alert("Category already exists!");
                              setSkillCategory(cleanName);
                              return;
                            }
                            const updated = [...customCategories, cleanName];
                            await handleSaveCategories(updated);
                            setSkillCategory(cleanName);
                            setNewCategoryName("");
                          }}
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSkillCategory(customCategories[0] || "");
                            setNewCategoryName("");
                          }}
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl text-xs cursor-pointer transition-colors border border-white/5"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Expertise Rating: <span className="text-violet-400 font-bold">{skillLevel}%</span>
                    </label>
                    <div className="flex items-center gap-4 py-2">
                      <input
                        type="range" min="10" max="100" step="5"
                        value={skillLevel} onChange={e => setSkillLevel(Number(e.target.value))}
                        className="flex-1 accent-violet-500 h-1 bg-white/10 rounded-lg cursor-pointer"
                      />
                      <div className="w-16 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                        <span className="text-xs font-semibold text-white">{skillLevel}%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full mt-4 py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingSkillId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingSkillId ? "Save Changes" : "Create Skill Entry"}
                  </button>
                </div>
              </form>
            </AdminEditModal>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Credentials & Prestasi</h1>
                <p className="text-zinc-400 text-sm mt-1">Manage certifications, awards, and licenses shown under Academic & Professional Credentials</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetAchForm();
                  setEditingAchId(null);
                  setIsAchModalOpen(true);
                }}
                className="px-5 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Credential
              </button>
            </div>

            {/* List */}
            <div className="glass-card rounded-3xl p-6 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-6">Current Credentials ({achievements.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase font-semibold">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Issuer</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {achievements.map((a) => (
                      <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">{a.title}</td>
                        <td className="py-3 px-4 text-zinc-400">{a.issuer}</td>
                        <td className="py-3 px-4 text-zinc-500">
                          {a.date ? new Date(a.date).toLocaleDateString("id-ID", { year: "numeric", month: "short" }) : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingAchId(a.id);
                              setAchTitle(a.title);
                              setAchIssuer(a.issuer);
                              setAchDate(a.date ? new Date(a.date).toISOString().split("T")[0] : "");
                              setAchDesc(a.description || "");
                              setAchImage(a.image || "");
                              setAchContent(a.content || "");
                              let parsedLinks = [];
                              if (a.links) {
                                try {
                                  parsedLinks = JSON.parse(a.links);
                                } catch (e) {
                                  console.error("Failed to parse achievement links", e);
                                }
                              }
                              setAchLinks(Array.isArray(parsedLinks) ? parsedLinks : []);
                              setIsAchModalOpen(true);
                            }}
                            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAchievement(a.id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Achievement Add/Edit Modal */}
            <AdminEditModal
              isOpen={isAchModalOpen}
              onClose={() => {
                setIsAchModalOpen(false);
                setEditingAchId(null);
                resetAchForm();
              }}
              title={editingAchId ? "Edit Credential" : "Add New Credential"}
            >
              <form onSubmit={handleAddAchievement} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Title *</label>
                    <input
                      type="text" required value={achTitle} onChange={e => setAchTitle(e.target.value)}
                      placeholder="Advanced Next.js Developer"
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Issuer / Organization *</label>
                    <input
                      type="text" required value={achIssuer} onChange={e => setAchIssuer(e.target.value)}
                      placeholder="Vercel"
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Issue Date</label>
                      <input
                        type="date" value={achDate} onChange={e => setAchDate(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Short Description</label>
                      <input
                        type="text" value={achDesc} onChange={e => setAchDesc(e.target.value)}
                        placeholder="Verified competence..."
                        className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Certificate Image Field with file upload selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Certificate Image / Photo (Optional)</label>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text" value={achImage} onChange={e => setAchImage(e.target.value)}
                        placeholder="/uploads/cert1.jpg or external url"
                        className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                      />
                      <div className="flex gap-2">
                        <label className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors duration-250 border border-white/5">
                          {uploadingAchImage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-white" />
                          )}
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "achievement")}
                            disabled={uploadingAchImage}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOnSelectAsset(() => (url: string) => setAchImage(url));
                            setIsAssetPickerOpen(true);
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs tracking-wider uppercase border border-white/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Pilih Galeri</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Markdown Editor Toolbar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Rich Content / Details Page Markdown</label>
                      <div className="flex gap-3">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer">
                          {uploadingContentImage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          <span>Upload & Insert</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "achContent")}
                            disabled={uploadingContentImage}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOnSelectAsset(() => (url: string) => {
                              insertAtAchCursor(`\n![Image](${url})\n`);
                            });
                            setIsAssetPickerOpen(true);
                          }}
                          className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Pilih Galeri</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex flex-wrap gap-1 p-1.5 bg-white/5 border border-white/10 rounded-t-xl">
                        <button
                          type="button"
                          onClick={() => {
                            openCustomPrompt(
                              "Insert Image Link",
                              [
                                { name: "url", label: "Image URL *", placeholder: "https://example.com/image.jpg", required: true },
                                { name: "alt", label: "Description (Alt Text) - Optional", placeholder: "e.g. Certificate preview" }
                              ],
                              (values) => {
                                const altText = values.alt || "Image";
                                insertAtAchCursor(`![${altText}](${values.url})`);
                              }
                            );
                          }}
                          className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                          title="Insert Image Link"
                        >
                          <Image className="w-3 h-3" />
                          <span className="hidden sm:inline">Image</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            openCustomPrompt(
                              "Insert Video or Figma Embed",
                              [
                                { name: "url", label: "Embed URL (YouTube, Figma, etc.) *", placeholder: "https://youtube.com/watch?v=...", required: true },
                                { name: "title", label: "Media Title - Optional", placeholder: "e.g. Credential Demo Video" }
                              ],
                              (values) => {
                                const mediaTitle = values.title || "Embed Media";
                                insertAtAchCursor(`![${mediaTitle}](${values.url})`);
                              }
                            );
                          }}
                          className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                          title="Insert Video or Figma Embed"
                        >
                          <Video className="w-3 h-3" />
                          <span className="hidden sm:inline">Embed</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            openCustomPrompt(
                              "Insert Text Link",
                              [
                                { name: "url", label: "Link URL *", placeholder: "https://example.com", required: true },
                                { name: "text", label: "Link Text *", placeholder: "e.g. Verify Certificate", required: true }
                              ],
                              (values) => {
                                insertAtAchCursor(`[${values.text}](${values.url})`);
                              }
                            );
                          }}
                          className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                          title="Insert Text Link"
                        >
                          <Link className="w-3 h-3" />
                          <span className="hidden sm:inline">Link</span>
                        </button>

                        <div className="w-px h-4 bg-white/10 mx-1 align-self-center" />

                        <button
                          type="button"
                          onClick={() => {
                            const textarea = achContentRef.current;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const selected = achContent.substring(start, end);
                              if (selected) {
                                insertAtAchCursor(`**${selected}**`);
                              } else {
                                insertAtAchCursor(`**Bold Text**`);
                              }
                            } else {
                              insertAtAchCursor(`**Bold Text**`);
                            }
                          }}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center font-bold"
                          title="Bold text"
                        >
                          <Bold className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const textarea = achContentRef.current;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const selected = achContent.substring(start, end);
                              if (selected) {
                                insertAtAchCursor(`*${selected}*`);
                              } else {
                                insertAtAchCursor(`*Italic Text*`);
                              }
                            } else {
                              insertAtAchCursor(`*Italic Text*`);
                            }
                          }}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center italic"
                          title="Italic text"
                        >
                          <Italic className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            insertAtAchCursor(`\n### `);
                          }}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center font-bold"
                          title="Heading 3"
                        >
                          <Heading className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            insertAtAchCursor(`\n- `);
                          }}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center"
                          title="Bullet List"
                        >
                          <List className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            insertAtAchCursor(`\n> `);
                          }}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center"
                          title="Quote"
                        >
                          <Quote className="w-3 h-3" />
                        </button>
                      </div>

                      <textarea
                        ref={achContentRef}
                        rows={8} value={achContent} onChange={e => setAchContent(e.target.value)}
                        placeholder="Detailed certification history, verified competence, markdown story, or images..."
                        className="w-full px-5 py-3.5 rounded-b-xl bg-white/5 border border-white/10 border-t-0 focus:border-violet-500 outline-none text-white text-sm transition-all duration-200 resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* Achievement Dynamic Links Builder */}
                <div className="lg:col-span-2 space-y-4 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Credential Action Links ({achLinks.length})</label>
                    <button
                      type="button"
                      onClick={() => setAchLinks([...achLinks, { label: "", url: "", icon: "link" }])}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Link
                    </button>
                  </div>

                  {achLinks.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-2">No links added yet. Tautan verifikasi sertifikat, figma, atau file jurnal bisa ditambahkan di sini.</p>
                  ) : (
                    <div className="space-y-4">
                      {achLinks.map((link, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              required
                              placeholder="Label (e.g. Verify Certificate, GitHub)"
                              value={link.label}
                              onChange={(e) => {
                                const updated = [...achLinks];
                                updated[idx].label = e.target.value;
                                setAchLinks(updated);
                              }}
                              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                            />
                          </div>
                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              required
                              placeholder="URL (https://...)"
                              value={link.url}
                              onChange={(e) => {
                                const updated = [...achLinks];
                                updated[idx].url = e.target.value;
                                // Auto detect icon on URL change if it's currently default 'link'
                                if (link.icon === "link") {
                                  const val = e.target.value.toLowerCase();
                                  if (val.includes("github.com")) updated[idx].icon = "github";
                                  else if (val.includes("instagram.com")) updated[idx].icon = "camera";
                                  else if (val.includes("youtube.com") || val.includes("youtu.be") || val.includes("vimeo.com")) updated[idx].icon = "video";
                                  else if (val.endsWith(".pdf") || val.includes("drive.google.com") || val.includes("jurnal") || val.includes("journal") || val.includes("paper")) updated[idx].icon = "file";
                                }
                                setAchLinks(updated);
                              }}
                              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                            />
                          </div>
                          <div className="w-full sm:w-auto">
                            <select
                              value={link.icon}
                              onChange={(e) => {
                                const updated = [...achLinks];
                                updated[idx].icon = e.target.value;
                                setAchLinks(updated);
                              }}
                              className="w-full sm:w-36 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                            >
                              <option value="link" className="bg-[#0f0f0f] text-white">🌐 Link (Default)</option>
                              <option value="github" className="bg-[#0f0f0f] text-white">💻 GitHub</option>
                              <option value="camera" className="bg-[#0f0f0f] text-white">📸 Galeri Foto</option>
                              <option value="video" className="bg-[#0f0f0f] text-white">🎥 Video Reel</option>
                              <option value="file" className="bg-[#0f0f0f] text-white">📄 Dokumen / Jurnal</option>
                              <option value="layout" className="bg-[#0f0f0f] text-white">🎨 Desain / UI/UX</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAchLinks(achLinks.filter((_, i) => i !== idx));
                            }}
                            className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl cursor-pointer transition-colors flex-shrink-0"
                            title="Delete Link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 pt-4 border-t border-white/10">
                  <button
                    type="submit" disabled={loading}
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingAchId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingAchId ? "Save Changes" : "Create Credential Entry"}
                  </button>
                </div>
              </form>
            </AdminEditModal>
          </div>
        )}

        {activeTab === "community" && (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Community & Leadership</h1>
                <p className="text-zinc-400 text-sm mt-1">Manage debate tournaments, literacy ambassador experience, and leadership roles</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetCommForm();
                  setEditingCommId(null);
                  setIsCommModalOpen(true);
                }}
                className="px-5 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Activity
              </button>
            </div>

            {/* List */}
            <div className="glass-card rounded-3xl p-6 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-6">Current Activities ({community.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase font-semibold">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Organization</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {community.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">{c.title}</td>
                        <td className="py-3 px-4 text-zinc-400">{c.role}</td>
                        <td className="py-3 px-4 text-zinc-400">{c.organization}</td>
                        <td className="py-3 px-4 text-zinc-500">{c.dateRange}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingCommId(c.id);
                              setCommTitle(c.title);
                              setCommRole(c.role);
                              setCommOrg(c.organization);
                              setCommDateRange(c.dateRange);
                              setCommDesc(c.description || "");
                              setCommImage(c.image || "");
                              setCommContent(c.content || "");
                              let parsedLinks = [];
                              if (c.links) {
                                try {
                                  parsedLinks = JSON.parse(c.links);
                                } catch (e) {
                                  console.error("Failed to parse community links:", e);
                                }
                              }
                              setCommLinks(parsedLinks);
                              setIsCommModalOpen(true);
                            }}
                            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCommunity(c.id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Community Add/Edit Modal */}
            <AdminEditModal
              isOpen={isCommModalOpen}
              onClose={() => {
                setIsCommModalOpen(false);
                setEditingCommId(null);
                resetCommForm();
              }}
              title={editingCommId ? "Edit Activity" : "Add New Activity"}
            >
              <form onSubmit={handleAddCommunity} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Title *</label>
                    <input
                      type="text" required value={commTitle} onChange={e => setCommTitle(e.target.value)}
                      placeholder="Law Debate Competition or West Java Literacy Ambassador"
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Role *</label>
                    <input
                      type="text" required value={commRole} onChange={e => setCommRole(e.target.value)}
                      placeholder="1st Place Winner or Duta Baca Finalist"
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Organization *</label>
                    <input
                      type="text" required value={commOrg} onChange={e => setCommOrg(e.target.value)}
                      placeholder="Provincial Library & Archives Office"
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Date / Year Range *</label>
                    <input
                      type="text" required value={commDateRange} onChange={e => setCommDateRange(e.target.value)}
                      placeholder="2023 - 2024 or 2024"
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    />
                  </div>
                  {/* Image field */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Activity Image / Certificate Photo (Optional)</label>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text" value={commImage} onChange={e => setCommImage(e.target.value)}
                        placeholder="/uploads/activity1.jpg or external url"
                        className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                      />
                      <div className="flex gap-2">
                        <label className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors duration-250 border border-white/5">
                          {uploadingCommImage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-white" />
                          )}
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "community")}
                            disabled={uploadingCommImage}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOnSelectAsset(() => (url: string) => setCommImage(url));
                            setIsAssetPickerOpen(true);
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs tracking-wider uppercase border border-white/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Pilih Galeri</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Short Description</label>
                    <textarea
                      rows={3} value={commDesc} onChange={e => setCommDesc(e.target.value)}
                      placeholder="Detailed responsibilities, achievements, and impact..."
                      className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-sm transition-all duration-200"
                    />
                  </div>
                  {/* Rich Content Markdown Editor */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Rich Content / Details Page Markdown</label>
                      <div className="flex gap-3">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer">
                          {uploadingContentImage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          <span>Upload & Insert</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "commContent")}
                            disabled={uploadingContentImage}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOnSelectAsset(() => (url: string) => {
                              insertAtCommCursor(`\n![Image](${url})\n`);
                            });
                            setIsAssetPickerOpen(true);
                          }}
                          className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Pilih Galeri</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex flex-wrap gap-1 p-1.5 bg-white/5 border border-white/10 rounded-t-xl">
                        <button
                          type="button"
                          onClick={() => {
                            openCustomPrompt(
                              "Insert Image Link",
                              [
                                { name: "url", label: "Image URL *", placeholder: "https://example.com/image.jpg", required: true },
                                { name: "alt", label: "Description (Alt Text) - Optional", placeholder: "e.g. Activity preview" }
                              ],
                              (values) => {
                                const altText = values.alt || "Image";
                                insertAtCommCursor(`![${altText}](${values.url})`);
                              }
                            );
                          }}
                          className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                          title="Insert Image Link"
                        >
                          <Image className="w-3 h-3" />
                          <span className="hidden sm:inline">Image</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            openCustomPrompt(
                              "Insert Video or Figma Embed",
                              [
                                { name: "url", label: "Embed URL (YouTube, Figma, etc.) *", placeholder: "https://youtube.com/watch?v=...", required: true },
                                { name: "title", label: "Media Title - Optional", placeholder: "e.g. Activity Video" }
                              ],
                              (values) => {
                                const mediaTitle = values.title || "Embed Media";
                                insertAtCommCursor(`![${mediaTitle}](${values.url})`);
                              }
                            );
                          }}
                          className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                          title="Insert Video or Figma Embed"
                        >
                          <Video className="w-3 h-3" />
                          <span className="hidden sm:inline">Embed</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            openCustomPrompt(
                              "Insert Text Link",
                              [
                                { name: "url", label: "Link URL *", placeholder: "https://example.com", required: true },
                                { name: "text", label: "Link Text *", placeholder: "e.g. Visit Website", required: true }
                              ],
                              (values) => {
                                insertAtCommCursor(`[${values.text}](${values.url})`);
                              }
                            );
                          }}
                          className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                          title="Insert Text Link"
                        >
                          <Link className="w-3 h-3" />
                          <span className="hidden sm:inline">Link</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            insertAtCommCursor(`\n**bold text**`);
                          }}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center font-bold"
                          title="Bold Text"
                        >
                          <Bold className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            insertAtCommCursor(`\n*italic text*`);
                          }}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center italic"
                          title="Italic Text"
                        >
                          <Italic className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            insertAtCommCursor(`\n## `);
                          }}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center font-bold"
                          title="Heading 2"
                        >
                          <Heading className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            insertAtCommCursor(`\n### `);
                          }}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center font-bold"
                          title="Heading 3"
                        >
                          <Heading className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            insertAtCommCursor(`\n- `);
                          }}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center"
                          title="Bullet List"
                        >
                          <List className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            insertAtCommCursor(`\n> `);
                          }}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center"
                          title="Quote"
                        >
                          <Quote className="w-3 h-3" />
                        </button>
                      </div>

                      <textarea
                        ref={commContentRef}
                        rows={8} value={commContent} onChange={e => setCommContent(e.target.value)}
                        placeholder="Detailed activity history, certificates, stories, or achievements..."
                        className="w-full px-5 py-3.5 rounded-b-xl bg-white/5 border border-white/10 border-t-0 focus:border-violet-500 outline-none text-white text-sm transition-all duration-200 resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* Community Dynamic Links Builder */}
                <div className="lg:col-span-2 space-y-4 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Activity Action Links ({commLinks.length})</label>
                    <button
                      type="button"
                      onClick={() => setCommLinks([...commLinks, { label: "", url: "", icon: "link" }])}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Link
                    </button>
                  </div>

                  {commLinks.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-2">No links added yet. Tautan dokumentasi, instagram, atau figma kegiatan bisa ditambahkan di sini.</p>
                  ) : (
                    <div className="space-y-4">
                      {commLinks.map((link, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              required
                              placeholder="Label (e.g. Documentation, Instagram)"
                              value={link.label}
                              onChange={(e) => {
                                const updated = [...commLinks];
                                updated[idx].label = e.target.value;
                                setCommLinks(updated);
                              }}
                              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                            />
                          </div>
                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              required
                              placeholder="URL (https://...)"
                              value={link.url}
                              onChange={(e) => {
                                const updated = [...commLinks];
                                updated[idx].url = e.target.value;
                                // Auto detect icon
                                if (link.icon === "link") {
                                  const val = e.target.value.toLowerCase();
                                  if (val.includes("github.com")) updated[idx].icon = "github";
                                  else if (val.includes("instagram.com")) updated[idx].icon = "camera";
                                  else if (val.includes("youtube.com") || val.includes("youtu.be") || val.includes("vimeo.com")) updated[idx].icon = "video";
                                  else if (val.endsWith(".pdf") || val.includes("drive.google.com") || val.includes("jurnal") || val.includes("journal") || val.includes("paper")) updated[idx].icon = "file";
                                }
                                setCommLinks(updated);
                              }}
                              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                            />
                          </div>
                          <div className="w-full sm:w-auto">
                            <select
                              value={link.icon}
                              onChange={(e) => {
                                const updated = [...commLinks];
                                updated[idx].icon = e.target.value;
                                setCommLinks(updated);
                              }}
                              className="w-full sm:w-36 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                            >
                              <option value="link" className="bg-[#0f0f0f] text-white">🌐 Link (Default)</option>
                              <option value="github" className="bg-[#0f0f0f] text-white">💻 GitHub</option>
                              <option value="camera" className="bg-[#0f0f0f] text-white">📸 Galeri Foto</option>
                              <option value="video" className="bg-[#0f0f0f] text-white">🎥 Video Reel</option>
                              <option value="file" className="bg-[#0f0f0f] text-white">📄 Dokumen / Jurnal</option>
                              <option value="layout" className="bg-[#0f0f0f] text-white">🎨 Desain / UI/UX</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCommLinks(commLinks.filter((_, i) => i !== idx));
                            }}
                            className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl cursor-pointer transition-colors flex-shrink-0"
                            title="Delete Link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 pt-4 border-t border-white/10">
                  <button
                    type="submit" disabled={loading}
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCommId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingCommId ? "Save Changes" : "Create Activity Entry"}
                  </button>
                </div>
              </form>
            </AdminEditModal>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Contact & Social Links</h1>
                <p className="text-zinc-400 text-sm mt-1">Configure email, WhatsApp, LinkedIn, GitHub, and other contact links shown in the footer</p>
              </div>
              <button
                type="button"
                onClick={() => setContactLinks([...contactLinks, { label: "", url: "", icon: "link", username: "" }])}
                className="px-5 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Contact Link
              </button>
            </div>

            <form onSubmit={handleSaveContactLinks} className="glass-card rounded-3xl p-6 border border-white/5 space-y-6">
              <h2 className="text-lg font-bold text-white mb-4">Current Contact Links ({contactLinks.length})</h2>
              
              {contactLinks.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-zinc-500 text-sm font-light">No contact or social links added yet. Click "Add Contact Link" to start.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contactLinks.map((link, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Label</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. WhatsApp, LinkedIn, Email"
                          value={link.label}
                          onChange={(e) => {
                            const updated = [...contactLinks];
                            updated[idx].label = e.target.value;
                            setContactLinks(updated);
                          }}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">URL (Link)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. https://wa.me/..., mailto:..."
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...contactLinks];
                            updated[idx].url = e.target.value;
                            // Auto detect icon on URL change if it's currently default 'link'
                            if (link.icon === "link" || link.icon === "globe") {
                              const val = e.target.value.toLowerCase();
                              if (val.includes("github.com")) updated[idx].icon = "github";
                              else if (val.includes("instagram.com")) updated[idx].icon = "instagram";
                              else if (val.includes("linkedin.com")) updated[idx].icon = "linkedin";
                              else if (val.includes("wa.me") || val.includes("whatsapp") || val.startsWith("tel:")) updated[idx].icon = "phone";
                              else if (val.startsWith("mailto:") || val.includes("@")) updated[idx].icon = "mail";
                            }
                            setContactLinks(updated);
                          }}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Username / Value (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. @wardannugraha, +62 8..."
                          value={link.username || ""}
                          onChange={(e) => {
                            const updated = [...contactLinks];
                            updated[idx].username = e.target.value;
                            setContactLinks(updated);
                          }}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                        />
                      </div>
                      <div className="w-full sm:w-auto">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Icon type</label>
                        <select
                          value={link.icon}
                          onChange={(e) => {
                            const updated = [...contactLinks];
                            updated[idx].icon = e.target.value;
                            setContactLinks(updated);
                          }}
                          className="w-full sm:w-44 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                        >
                          <option value="mail" className="bg-[#0f0f0f] text-white">✉️ Email (mail)</option>
                          <option value="phone" className="bg-[#0f0f0f] text-white">📞 WhatsApp / Phone (phone)</option>
                          <option value="linkedin" className="bg-[#0f0f0f] text-white">💼 LinkedIn (linkedin)</option>
                          <option value="github" className="bg-[#0f0f0f] text-white">💻 GitHub (github)</option>
                          <option value="instagram" className="bg-[#0f0f0f] text-white">📸 Instagram (instagram)</option>
                          <option value="globe" className="bg-[#0f0f0f] text-white">🌐 Website (globe)</option>
                        </select>
                      </div>
                      <div className="pt-4 sm:pt-5 flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveContactLink(idx, "up")}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
                          title="Move Up (Left)"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === contactLinks.length - 1}
                          onClick={() => handleMoveContactLink(idx, "down")}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
                          title="Move Down (Right)"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setContactLinks(contactLinks.filter((_, i) => i !== idx));
                          }}
                          className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl cursor-pointer transition-colors flex-shrink-0"
                          title="Delete Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-white/10">
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Contact Links</span>
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Asset Picker Modal */}
        <AdminEditModal
          isOpen={isAssetPickerOpen}
          onClose={() => setIsAssetPickerOpen(false)}
          title="Select Existing Photo"
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">Choose a photo from files you have previously uploaded to save storage space.</p>
            {isLoadingAssets && galleryAssets.length === 0 ? (
              <div className="py-8 flex justify-center items-center gap-2 text-zinc-500 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                <span>Loading assets...</span>
              </div>
            ) : galleryAssets.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500 text-xs">
                No existing photo uploads found.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[45vh] overflow-y-auto pr-1">
                  {galleryAssets.map((asset) => (
                    <div
                      key={asset.url}
                      className="aspect-square rounded-xl border border-white/5 bg-zinc-950 overflow-hidden relative group hover:border-violet-500 transition-all"
                    >
                      {/* Image Click to Select */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectAsset(asset.url);
                          setIsAssetPickerOpen(false);
                        }}
                        className="w-full h-full text-left outline-none cursor-pointer"
                      >
                        <img
                          src={getThumbnailUrl(asset.url)}
                          alt="Asset"
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-semibold text-white transition-opacity">
                          Select
                        </div>
                      </button>

                      {/* Active green checkmark indicator */}
                      {asset.inUse && (
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-emerald-500 border border-white/10 flex items-center justify-center text-zinc-950 shadow-md select-none">
                          <Check className="w-3 h-3 stroke-[4]" />
                        </div>
                      )}

                      {/* Delete Button (only if not in use) */}
                      {!asset.inUse && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAsset(asset.url);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md"
                          title="Delete unused photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {hasMoreAssets && (
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      disabled={isLoadingAssets}
                      onClick={() => fetchAssets(false)}
                      className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-md"
                    >
                      {isLoadingAssets ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : null}
                      <span>Tampilkan Lebih Banyak</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </AdminEditModal>

        {/* Custom Prompt Modal */}
        <AdminEditModal
          isOpen={promptOpen}
          onClose={() => setPromptOpen(false)}
          title={promptTitle}
          maxWidthClass="max-w-md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (promptSubmitCallback) {
                promptSubmitCallback(promptValues);
              }
              setPromptOpen(false);
            }}
            className="space-y-4"
          >
            {promptFields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  {field.label}
                </label>
                <input
                  type="text"
                  required={field.required}
                  placeholder={field.placeholder}
                  value={promptValues[field.name] || ""}
                  onChange={(e) => {
                    setPromptValues((prev) => ({ ...prev, [field.name]: e.target.value }));
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.07] outline-none text-white text-xs transition-all duration-200"
                />
              </div>
            ))}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setPromptOpen(false)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Insert
              </button>
            </div>
          </form>
        </AdminEditModal>

        {/* Custom Confirmation Modal */}
        <AdminEditModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirm Action"
          maxWidthClass="max-w-md"
        >
          <div className="space-y-6">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {confirmMessage}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmCallback) confirmCallback();
                  setConfirmOpen(false);
                }}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-red-950/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </AdminEditModal>
      </main>
    </div>
  );
}

interface AdminEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

function AdminEditModal({ isOpen, onClose, title, children, maxWidthClass = "max-w-2xl" }: AdminEditModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose} 
      />
      {/* Modal Content */}
      <div className={`relative glass-modal rounded-3xl p-6 sm:p-8 ${maxWidthClass} w-full max-h-[90vh] overflow-y-auto z-10 border border-white/10 shadow-2xl transition-all duration-300 transform scale-100 flex flex-col gap-6`}>
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-zinc-400 hover:text-white p-2 rounded-full bg-white/5 border border-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[72vh] md:max-h-[76vh] pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function getThumbnailUrl(url: string) {
  if (!url) return "/uploads/default.jpg";
  if (url.includes("res.cloudinary.com")) {
    return url.replace("/image/upload/", "/image/upload/w_150,h_100,c_fill,q_auto,f_auto/");
  }
  return url;
}
