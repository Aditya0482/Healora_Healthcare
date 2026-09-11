'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CARTOON_AVATARS, getAvatarUrl } from '@/lib/avatars';
import {
  User,
  Briefcase,
  MapPin,
  Lock,
  Package,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  Loader2,
  Sparkles,
  ArrowLeft,
  Building,
  Calendar,
  Phone,
  Mail,
  Home,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

function AccountSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const queryTab = searchParams.get('tab');
  const initialTab =
    queryTab && ['personal', 'professional', 'avatar', 'addresses', 'security'].includes(queryTab)
      ? (queryTab as any)
      : 'personal';

  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'avatar' | 'addresses' | 'security'>(initialTab);

  // Update tab if query changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['personal', 'professional', 'avatar', 'addresses', 'security'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  // Form states - Personal
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bio, setBio] = useState('');

  // Form states - Professional
  const [profession, setProfession] = useState('');
  const [organization, setOrganization] = useState('');
  const [designation, setDesignation] = useState('');

  // Form states - Avatar
  const [selectedAvatar, setSelectedAvatar] = useState('');

  // Form states - Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delivery Addresses state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Address modal form
  const [addrRecipient, setAddrRecipient] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrType, setAddrType] = useState('Home');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Email Change Modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailStep, setEmailStep] = useState<'ENTER_EMAIL' | 'ENTER_OTP'>('ENTER_EMAIL');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailModalError, setEmailModalError] = useState('');
  const [emailModalSuccess, setEmailModalSuccess] = useState('');

  // Status feedback
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/account/settings');
      return;
    }

    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setSelectedAvatar(user.avatar || CARTOON_AVATARS[0].id);
      setProfession(user.profession || '');
      setOrganization(user.organization || '');
      setDesignation(user.designation || '');
      setGender(user.gender || '');
      setDateOfBirth(user.dateOfBirth || '');
      setBio(user.bio || '');
      loadAddresses();
    }
  }, [user, authLoading, router]);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg('');
    } else {
      setSuccessMsg(msg);
      setErrorMsg('');
    }
    setTimeout(() => {
      setSuccessMsg('');
      setErrorMsg('');
    }, 4000);
  };

  // Save Profile (Personal or Professional or Avatar)
  const handleSaveProfile = async (customPayload?: any) => {
    const cleanPhone = (customPayload?.phone || phone || '').trim().replace(/[^0-9]/g, '');
    if (!customPayload && (!cleanPhone || cleanPhone.length < 10)) {
      showNotification('Mobile phone number is mandatory (min 10 digits).', true);
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = customPayload || {
        fullName,
        phone: cleanPhone,
        avatar: selectedAvatar,
        profession,
        organization,
        designation,
        gender,
        dateOfBirth,
        bio,
      };

      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      await refreshUser();
      showNotification('Profile details updated successfully!');
    } catch (err: any) {
      showNotification(err.message || 'Error updating profile', true);
    } finally {
      setSaving(false);
    }
  };

  // Open Email Change Modal
  const openEmailChangeModal = () => {
    setNewEmailInput('');
    setEmailOtpInput('');
    setEmailStep('ENTER_EMAIL');
    setEmailModalError('');
    setEmailModalSuccess('');
    setShowEmailModal(true);
  };

  // Request OTP for new email
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = newEmailInput.trim().toLowerCase();

    if (!cleanEmail) {
      setEmailModalError('Kripya naya email address enter karein');
      return;
    }

    if (!cleanEmail.endsWith('@gmail.com') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailModalError('Please enter a valid Gmail address ending with @gmail.com');
      return;
    }

    if (cleanEmail === user?.email?.toLowerCase()) {
      setEmailModalError('Naya email aapke vartaman email se alag hona chahiye');
      return;
    }

    setEmailLoading(true);
    setEmailModalError('');
    setEmailModalSuccess('');

    try {
      const res = await fetch('/api/account/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REQUEST_OTP',
          newEmail: cleanEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP to new email');
      }

      setEmailStep('ENTER_OTP');
      setEmailModalSuccess(data.message || `OTP sent to ${cleanEmail}`);
    } catch (err: any) {
      setEmailModalError(err.message || 'Error sending OTP');
    } finally {
      setEmailLoading(false);
    }
  };

  // Verify OTP and complete email change
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = emailOtpInput.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setEmailModalError('Kripya valid 6-digit OTP enter karein');
      return;
    }

    setEmailLoading(true);
    setEmailModalError('');
    setEmailModalSuccess('');

    try {
      const res = await fetch('/api/account/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VERIFY_OTP',
          otp: cleanOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      await refreshUser();
      setShowEmailModal(false);
      showNotification('Email address successfully updated and verified with OTP!');
    } catch (err: any) {
      setEmailModalError(err.message || 'Error verifying OTP');
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle avatar select & save immediately
  const handleAvatarSelect = async (avatarId: string) => {
    setSelectedAvatar(avatarId);
    await handleSaveProfile({ avatar: avatarId });
  };

  // Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showNotification('Please enter your current password', true);
      return;
    }
    if (newPassword.length < 6) {
      showNotification('New password must be at least 6 characters long', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('New password and confirm password do not match', true);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showNotification('Password updated successfully!');
    } catch (err: any) {
      showNotification(err.message || 'Error updating password', true);
    } finally {
      setSaving(false);
    }
  };

  // Open Address Modal for New or Edit
  const openAddressModal = (addr?: any) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddrRecipient(addr.recipientName);
      setAddrPhone(addr.phone);
      setAddrLine1(addr.addressLine1);
      setAddrLine2(addr.addressLine2 || '');
      setAddrLandmark(addr.landmark || '');
      setAddrCity(addr.city);
      setAddrState(addr.state);
      setAddrPincode(addr.pincode);
      setAddrType(addr.addressType || 'Home');
      setAddrIsDefault(Boolean(addr.isDefault));
    } else {
      setEditingAddressId(null);
      setAddrRecipient(user?.fullName || '');
      setAddrPhone(user?.phone || '');
      setAddrLine1('');
      setAddrLine2('');
      setAddrLandmark('');
      setAddrCity('');
      setAddrState('');
      setAddrPincode('');
      setAddrType('Home');
      setAddrIsDefault(addresses.length === 0);
    }
    setShowAddressModal(true);
  };

  // Save Address (Create or Update)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = addrPhone.trim().replace(/[^0-9]/g, '');
    if (!addrRecipient || !cleanPhone || cleanPhone.length < 10 || !addrLine1 || !addrCity || !addrState || !addrPincode) {
      showNotification('Please fill in all mandatory fields with a valid 10-digit phone number', true);
      return;
    }

    setSaving(true);
    try {
      const isEdit = Boolean(editingAddressId);
      const url = '/api/addresses';
      const method = isEdit ? 'PUT' : 'POST';
      const body = {
        id: editingAddressId,
        recipientName: addrRecipient,
        phone: cleanPhone,
        addressLine1: addrLine1,
        addressLine2: addrLine2,
        landmark: addrLandmark,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        addressType: addrType,
        isDefault: addrIsDefault,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save address');
      }

      setShowAddressModal(false);
      await loadAddresses();
      showNotification(isEdit ? 'Address updated successfully!' : 'New address added successfully!');
    } catch (err: any) {
      showNotification(err.message || 'Error saving address', true);
    } finally {
      setSaving(false);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery address?')) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/addresses?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete address');

      await loadAddresses();
      showNotification('Address deleted successfully!');
    } catch (err: any) {
      showNotification(err.message || 'Error deleting address', true);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Breadcrumb & Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/account/profile" className="hover:text-teal-700 flex items-center gap-1 font-semibold">
              <ArrowLeft className="w-3 h-3" /> Back to Profile
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Settings</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings &amp; Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal details, professional profile, cartoon avatar, and delivery addresses.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow"
          >
            <User className="w-4 h-4" />
            View Full Profile
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition border border-slate-200"
          >
            <Package className="w-4 h-4 text-teal-700" />
            My Orders
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-semibold animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Sidebar Tabs & Right Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Profile Card & Tabs */}
        <div className="md:col-span-4 space-y-6">
          {/* User Preview Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-teal-600 to-emerald-600" />
            
            <div className="relative mt-8 mb-3 inline-block">
              <img
                src={getAvatarUrl(user.avatar || selectedAvatar)}
                alt={user.fullName}
                className="w-24 h-24 rounded-full mx-auto bg-white p-1 border-4 border-white shadow-md object-cover"
              />
              <button
                onClick={() => setActiveTab('avatar')}
                className="absolute bottom-0 right-0 bg-teal-700 hover:bg-teal-800 text-white p-1.5 rounded-full shadow transition"
                title="Change Avatar"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

            <h3 className="font-extrabold text-slate-900 text-base">{user.fullName}</h3>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            {user.profession && (
              <span className="inline-block mt-2 bg-teal-50 text-teal-800 text-[11px] font-bold px-3 py-1 rounded-full border border-teal-200">
                {user.profession} {user.organization ? `• ${user.organization}` : ''}
              </span>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('personal')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'personal'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              Personal Details
            </button>

            <button
              onClick={() => setActiveTab('professional')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'professional'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Professional Details
            </button>

            <button
              onClick={() => setActiveTab('avatar')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'avatar'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4" />
                Profile Avatar Photo
              </div>
              <span className="text-[10px] bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded font-black">
                16 Available
              </span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'addresses'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                Delivery Addresses
              </div>
              <span className="text-[11px] font-semibold opacity-80">({addresses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'security'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-4 h-4" />
              Password &amp; Security
            </button>
          </div>
        </div>

        {/* Right Column: Tab Contents */}
        <div className="md:col-span-8">
          {/* 1. PERSONAL DETAILS TAB */}
          {activeTab === 'personal' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900">Personal Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your personal profile information and contact credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Address
                    </label>
                    <button
                      type="button"
                      onClick={openEmailChangeModal}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      Change Email
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-xs text-slate-600 font-medium cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Account Email (Change via OTP)
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700"
                      placeholder="10-digit mobile number"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700 bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    About / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short bio or health notes..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveProfile()}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-3 px-6 rounded-xl transition shadow flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Personal Details
                </button>
              </div>
            </div>
          )}

          {/* 2. PROFESSIONAL DETAILS TAB */}
          {activeTab === 'professional' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900">Professional Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your profession, workplace, organization, and designation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Profession / Occupation
                  </label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Healthcare Worker, Engineer, Business, Student..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organization / Company / Workplace
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Apollo, Tech Corp, Self-Employed..."
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700"
                    />
                    <Building className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation / Title / Role
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Consultant, Manager, Proprietor..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveProfile()}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-3 px-6 rounded-xl transition shadow flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Professional Details
                </button>
              </div>
            </div>
          )}

          {/* 3. AVATAR SELECTION TAB */}
          {activeTab === 'avatar' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-black text-slate-900">Choose Your Profile Avatar</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your favorite avatar from the collection below. Click any avatar to set it as your profile photo.
                </p>
              </div>

              {/* Active selection preview */}
              <div className="flex items-center gap-4 p-4 bg-teal-50/50 border border-teal-100 rounded-2xl">
                <img
                  src={getAvatarUrl(selectedAvatar)}
                  alt="Selected Avatar"
                  className="w-16 h-16 rounded-2xl bg-white shadow-sm border-2 border-teal-600 object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-teal-800">Current Selected Avatar</div>
                  <div className="text-sm font-black text-slate-900">
                    {CARTOON_AVATARS.find((a) => a.id === selectedAvatar)?.name || 'Default Avatar'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    This avatar is displayed across your account header, navbar, and orders.
                  </p>
                </div>
              </div>

              {/* Character Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {CARTOON_AVATARS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleAvatarSelect(avatar.id)}
                      className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 transition-all text-center group border-2 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/40 shadow-md ring-2 ring-teal-600/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-teal-600 text-white rounded-full p-1 shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${avatar.bgGradient} p-1 shadow-inner group-hover:scale-105 transition-transform`}>
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full rounded-full bg-white object-cover"
                        />
                      </div>

                      <div className="mt-1">
                        <div className="font-extrabold text-xs text-slate-900 group-hover:text-teal-700 transition">
                          {avatar.name}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {avatar.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. DELIVERY ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Delivery Addresses</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage and update shipping destinations for your medicine orders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAddressModal()}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Address
                </button>
              </div>

              {loadingAddresses ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-700 mx-auto" />
                </div>
              ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {addr.recipientName}
                          </span>
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            {addr.addressType}
                          </span>
                          {addr.isDefault && (
                            <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                          {addr.landmark ? ` (Near: ${addr.landmark})` : ''}
                        </div>
                        <div className="text-xs text-slate-600 font-semibold">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </div>
                        <div className="text-xs text-slate-500 pt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> Phone: {addr.phone}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        <button
                          onClick={() => openAddressModal(addr)}
                          className="text-xs font-bold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl p-6">
                  <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">No Saved Delivery Addresses</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Add your home or clinic address for faster one-click checkout.
                  </p>
                  <button
                    onClick={() => openAddressModal()}
                    className="mt-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Delivery Address
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 5. SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900">Password &amp; Security</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Change your account login password to keep your account safe.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-3 px-6 rounded-xl transition shadow flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Address Edit/Add Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-700" />
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    value={addrRecipient}
                    onChange={(e) => setAddrRecipient(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Flat / House / Building *</label>
                <input
                  type="text"
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street / Area / Locality</label>
                <input
                  type="text"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={addrLandmark}
                    onChange={(e) => setAddrLandmark(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Address Type</label>
                  <select
                    value={addrType}
                    onChange={(e) => setAddrType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700 bg-white"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    className="w-4 h-4 text-teal-700 rounded focus:ring-teal-700"
                  />
                  <span className="font-semibold text-slate-700">Set as default delivery address</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Change with OTP Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 my-8 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Change Account Email</h3>
                  <p className="text-[11px] text-slate-500">Secured with 6-digit OTP verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Error & Success Feedback inside Modal */}
            {emailModalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{emailModalError}</span>
              </div>
            )}

            {emailModalSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{emailModalSuccess}</span>
              </div>
            )}

            {emailStep === 'ENTER_EMAIL' ? (
              /* Step 1: Input New Email */
              <form onSubmit={handleSendEmailOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Registered Email
                  </label>
                  <input
                    type="text"
                    value={user?.email || ''}
                    disabled
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Gmail Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700"
                      required
                      autoFocus
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Must be a valid email ending with <strong className="text-slate-600">@gmail.com</strong>
                  </span>
                </div>

                <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-[11px] text-teal-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                    How Email Verification Works:
                  </div>
                  <p className="text-[11px] text-teal-700/90 leading-relaxed">
                    We will send a 6-digit OTP to your new Gmail address. Your account email will only be updated once you enter and confirm the code.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
                  >
                    {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    Send Verification Code
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Input 6-digit OTP */
              <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                <div className="text-center py-1">
                  <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-600">
                    A 6-digit code was sent to <strong className="text-slate-900">{newEmailInput}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={emailOtpInput}
                    onChange={(e) => setEmailOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center tracking-[10px] text-xl font-bold border-2 border-teal-600/40 rounded-xl p-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                    required
                    autoFocus
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>Valid for 10 minutes</span>
                    <button
                      type="button"
                      disabled={emailLoading}
                      onClick={() => handleSendEmailOtp()}
                      className="text-teal-700 font-bold hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailStep('ENTER_EMAIL');
                      setEmailModalError('');
                      setEmailModalSuccess('');
                    }}
                    className="text-xs text-slate-500 font-bold hover:text-slate-800 transition"
                  >
                    ← Change email
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={emailLoading}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
                    >
                      {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Verify &amp; Update
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-700 mx-auto" />
        </div>
      }
    >
      <AccountSettingsContent />
    </Suspense>
  );
}
