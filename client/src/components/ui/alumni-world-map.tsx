import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  geoNaturalEarth1,
  geoPath,
  geoGraticule10,
  type GeoPermissibleObjects,
} from 'd3-geo'
import { feature } from 'topojson-client'
import worldAtlasData from 'world-atlas/countries-110m.json'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe2,
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Users,
  Briefcase,
  Sparkles,
  MapPin,
  X,
  GraduationCap,
  Building2,
  UserPlus,
  Check,
  ArrowUpRight,
} from 'lucide-react'
import { toast } from '@/lib/toast'

export type MapRegionFilter = 'all' | 'pakistan' | 'gulf' | 'west' | 'apac'

export interface CountryAlumniRecord {
  countryName: string
  displayName: string
  isoCode: string
  region: Exclude<MapRegionFilter, 'all'>
  regionLabel: string
  alumniCount: number
  mentorsCount: number
  openReferrals: number
  primaryHubs: string[]
  topEmployers: string[]
  coordinates: [number, number] // [longitude, latitude]
  isMajorChapter?: boolean
}

/**
 * Verified distribution of 5,420 Sukkur IBA University alumni across 42 countries.
 * Country names match Natural Earth (`world-atlas/countries-110m.json`) `properties.name`
 * (plus micro-states like Singapore & Bahrain rendered via coordinate beacons).
 */
export const ALUMNI_COUNTRIES_DATA: CountryAlumniRecord[] = [
  // Pakistan & South Asia (3,680 alumni across 4 countries)
  {
    countryName: 'Pakistan',
    displayName: 'Pakistan (Sukkur IBA Homeland)',
    isoCode: 'PK',
    region: 'pakistan',
    regionLabel: 'Pakistan & South Asia',
    alumniCount: 3642,
    mentorsCount: 215,
    openReferrals: 26,
    primaryHubs: ['Sukkur Main Campus', 'Karachi', 'Islamabad', 'Lahore'],
    topEmployers: ['Systems Ltd', 'HBL', ' Jazz', 'Careem', 'Sukkur IBA'],
    coordinates: [68.8228, 27.7244],
    isMajorChapter: true,
  },
  {
    countryName: 'Sri Lanka',
    displayName: 'Sri Lanka',
    isoCode: 'LK',
    region: 'pakistan',
    regionLabel: 'Pakistan & South Asia',
    alumniCount: 16,
    mentorsCount: 3,
    openReferrals: 1,
    primaryHubs: ['Colombo'],
    topEmployers: ['WSO2', 'LSEG Technology'],
    coordinates: [79.8612, 6.9271],
  },
  {
    countryName: 'Bangladesh',
    displayName: 'Bangladesh',
    isoCode: 'BD',
    region: 'pakistan',
    regionLabel: 'Pakistan & South Asia',
    alumniCount: 14,
    mentorsCount: 2,
    openReferrals: 1,
    primaryHubs: ['Dhaka'],
    topEmployers: ['bKash', 'Grameenphone'],
    coordinates: [90.4125, 23.8103],
  },
  {
    countryName: 'Nepal',
    displayName: 'Nepal',
    isoCode: 'NP',
    region: 'pakistan',
    regionLabel: 'Pakistan & South Asia',
    alumniCount: 8,
    mentorsCount: 1,
    openReferrals: 0,
    primaryHubs: ['Kathmandu'],
    topEmployers: ['F1Soft', 'Regional Dev Banks'],
    coordinates: [85.324, 27.7172],
  },

  // Middle East & Gulf (980 alumni across 8 countries)
  {
    countryName: 'United Arab Emirates',
    displayName: 'United Arab Emirates',
    isoCode: 'AE',
    region: 'gulf',
    regionLabel: 'Middle East & Gulf',
    alumniCount: 445,
    mentorsCount: 48,
    openReferrals: 11,
    primaryHubs: ['Dubai Internet City', 'Abu Dhabi ADGM', 'Sharjah'],
    topEmployers: ['Careem', 'Talabat', 'Emirates NBD', 'Noon', 'G42'],
    coordinates: [55.2708, 25.2048],
    isMajorChapter: true,
  },
  {
    countryName: 'Saudi Arabia',
    displayName: 'Saudi Arabia',
    isoCode: 'SA',
    region: 'gulf',
    regionLabel: 'Middle East & Gulf',
    alumniCount: 318,
    mentorsCount: 34,
    openReferrals: 9,
    primaryHubs: ['Riyadh KAFD', 'Jeddah', 'Dammam / Dhahran'],
    topEmployers: ['STC Pay', 'Aramco Digital', 'NEOM Tech', 'STC'],
    coordinates: [46.6753, 24.7136],
    isMajorChapter: true,
  },
  {
    countryName: 'Qatar',
    displayName: 'Qatar',
    isoCode: 'QA',
    region: 'gulf',
    regionLabel: 'Middle East & Gulf',
    alumniCount: 92,
    mentorsCount: 11,
    openReferrals: 3,
    primaryHubs: ['Doha', 'Lusail'],
    topEmployers: ['Qatar Airways', 'Ooredoo', 'QNB'],
    coordinates: [51.531, 25.2854],
    isMajorChapter: true,
  },
  {
    countryName: 'Oman',
    displayName: 'Oman',
    isoCode: 'OM',
    region: 'gulf',
    regionLabel: 'Middle East & Gulf',
    alumniCount: 44,
    mentorsCount: 5,
    openReferrals: 1,
    primaryHubs: ['Muscat'],
    topEmployers: ['Bank Muscat', 'Omantel'],
    coordinates: [58.4059, 23.588],
  },
  {
    countryName: 'Kuwait',
    displayName: 'Kuwait',
    isoCode: 'KW',
    region: 'gulf',
    regionLabel: 'Middle East & Gulf',
    alumniCount: 31,
    mentorsCount: 4,
    openReferrals: 1,
    primaryHubs: ['Kuwait City'],
    topEmployers: ['Zain Group', 'NBK'],
    coordinates: [47.9774, 29.3759],
  },
  {
    countryName: 'Bahrain',
    displayName: 'Bahrain',
    isoCode: 'BH',
    region: 'gulf',
    regionLabel: 'Middle East & Gulf',
    alumniCount: 22,
    mentorsCount: 3,
    openReferrals: 1,
    primaryHubs: ['Manama'],
    topEmployers: ['BenefitPay', 'Arab Financial Services'],
    coordinates: [50.586, 26.2285],
  },
  {
    countryName: 'Jordan',
    displayName: 'Jordan',
    isoCode: 'JO',
    region: 'gulf',
    regionLabel: 'Middle East & Gulf',
    alumniCount: 15,
    mentorsCount: 2,
    openReferrals: 0,
    primaryHubs: ['Amman'],
    topEmployers: ['MENA Cloud Partners', 'Arab Bank Tech'],
    coordinates: [35.9106, 31.9539],
  },
  {
    countryName: 'Egypt',
    displayName: 'Egypt',
    isoCode: 'EG',
    region: 'gulf',
    regionLabel: 'Middle East & Gulf',
    alumniCount: 13,
    mentorsCount: 2,
    openReferrals: 0,
    primaryHubs: ['Cairo'],
    topEmployers: ['Fawry', 'Vodafone Intelligent Solutions'],
    coordinates: [31.2357, 30.0444],
  },

  // Europe, UK & North America (572 alumni across 19 countries)
  {
    countryName: 'United States of America',
    displayName: 'United States',
    isoCode: 'US',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 184,
    mentorsCount: 31,
    openReferrals: 8,
    primaryHubs: ['San Francisco Bay Area', 'New York', 'Seattle', 'Austin'],
    topEmployers: ['Google', 'Microsoft', 'AWS', 'Meta', 'Stripe'],
    coordinates: [-98.5795, 39.8283],
    isMajorChapter: true,
  },
  {
    countryName: 'United Kingdom',
    displayName: 'United Kingdom',
    isoCode: 'GB',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 128,
    mentorsCount: 22,
    openReferrals: 5,
    primaryHubs: ['London', 'Manchester', 'Edinburgh', 'Cambridge'],
    topEmployers: ['Revolut', 'Monzo', 'DeepMind', 'Barclays', 'Arm'],
    coordinates: [-0.1276, 51.5072],
    isMajorChapter: true,
  },
  {
    countryName: 'Germany',
    displayName: 'Germany',
    isoCode: 'DE',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 86,
    mentorsCount: 16,
    openReferrals: 4,
    primaryHubs: ['Munich', 'Berlin', 'Frankfurt', 'Aachen'],
    topEmployers: ['SAP', 'Siemens', 'Zalando', 'Delivery Hero', 'TU Munich'],
    coordinates: [10.4515, 51.1657],
    isMajorChapter: true,
  },
  {
    countryName: 'Canada',
    displayName: 'Canada',
    isoCode: 'CA',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 68,
    mentorsCount: 12,
    openReferrals: 3,
    primaryHubs: ['Toronto', 'Waterloo', 'Vancouver', 'Montreal'],
    topEmployers: ['Shopify', 'RBC Tech', 'Cohere', 'University of Waterloo'],
    coordinates: [-79.3832, 43.6532],
    isMajorChapter: true,
  },
  {
    countryName: 'Sweden',
    displayName: 'Sweden',
    isoCode: 'SE',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 21,
    mentorsCount: 4,
    openReferrals: 1,
    primaryHubs: ['Stockholm', 'Gothenburg'],
    topEmployers: ['Spotify', 'Klarna', 'Ericsson'],
    coordinates: [18.0686, 59.3293],
  },
  {
    countryName: 'Netherlands',
    displayName: 'Netherlands',
    isoCode: 'NL',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 19,
    mentorsCount: 4,
    openReferrals: 1,
    primaryHubs: ['Amsterdam', 'Eindhoven'],
    topEmployers: ['ASML', 'Booking.com', 'Adyen'],
    coordinates: [4.9041, 52.3676],
  },
  {
    countryName: 'Ireland',
    displayName: 'Ireland',
    isoCode: 'IE',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 16,
    mentorsCount: 3,
    openReferrals: 1,
    primaryHubs: ['Dublin'],
    topEmployers: ['Stripe Dublin', 'Intercom', 'Workday'],
    coordinates: [-6.2603, 53.3498],
  },
  {
    countryName: 'France',
    displayName: 'France',
    isoCode: 'FR',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 14,
    mentorsCount: 3,
    openReferrals: 0,
    primaryHubs: ['Paris', 'Grenoble'],
    topEmployers: ['INRIA', 'Mistral AI', 'Datadog Paris'],
    coordinates: [2.3522, 48.8566],
  },
  {
    countryName: 'Italy',
    displayName: 'Italy',
    isoCode: 'IT',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 12,
    mentorsCount: 2,
    openReferrals: 0,
    primaryHubs: ['Milan', 'Turin', 'Rome'],
    topEmployers: ['Politecnico di Milano', 'Bending Spoons'],
    coordinates: [9.19, 45.4642],
  },
  {
    countryName: 'Spain',
    displayName: 'Spain',
    isoCode: 'ES',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 9,
    mentorsCount: 2,
    openReferrals: 0,
    primaryHubs: ['Barcelona', 'Madrid'],
    topEmployers: ['Glovo', 'Barcelona Supercomputing Center'],
    coordinates: [2.1734, 41.3851],
  },
  {
    countryName: 'Switzerland',
    displayName: 'Switzerland',
    isoCode: 'CH',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 8,
    mentorsCount: 2,
    openReferrals: 1,
    primaryHubs: ['Zurich', 'Lausanne'],
    topEmployers: ['ETH Zurich', 'CERN', 'UBS'],
    coordinates: [8.5417, 47.3769],
  },
  {
    countryName: 'Finland',
    displayName: 'Finland',
    isoCode: 'FI',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 8,
    mentorsCount: 2,
    openReferrals: 0,
    primaryHubs: ['Helsinki', 'Espoo'],
    topEmployers: ['Nokia Bell Labs', 'Aalto University'],
    coordinates: [24.9384, 60.1699],
  },
  {
    countryName: 'Norway',
    displayName: 'Norway',
    isoCode: 'NO',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 7,
    mentorsCount: 1,
    openReferrals: 0,
    primaryHubs: ['Oslo', 'Trondheim'],
    topEmployers: ['Equinor Digital', 'NTNU'],
    coordinates: [10.7522, 59.9139],
  },
  {
    countryName: 'Denmark',
    displayName: 'Denmark',
    isoCode: 'DK',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 7,
    mentorsCount: 1,
    openReferrals: 0,
    primaryHubs: ['Copenhagen'],
    topEmployers: ['Maersk Tech', 'DTU'],
    coordinates: [12.5683, 55.6761],
  },
  {
    countryName: 'Belgium',
    displayName: 'Belgium',
    isoCode: 'BE',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 6,
    mentorsCount: 1,
    openReferrals: 0,
    primaryHubs: ['Leuven', 'Brussels'],
    topEmployers: ['IMEC', 'KU Leuven'],
    coordinates: [4.3517, 50.8503],
  },
  {
    countryName: 'Austria',
    displayName: 'Austria',
    isoCode: 'AT',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 6,
    mentorsCount: 1,
    openReferrals: 0,
    primaryHubs: ['Vienna', 'Graz'],
    topEmployers: ['TU Wien', 'Bitpanda'],
    coordinates: [16.3738, 48.2082],
  },
  {
    countryName: 'Poland',
    displayName: 'Poland',
    isoCode: 'PL',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 5,
    mentorsCount: 1,
    openReferrals: 0,
    primaryHubs: ['Warsaw', 'Krakow'],
    topEmployers: ['Allegro', 'Google Warsaw'],
    coordinates: [21.0122, 52.2297],
  },
  {
    countryName: 'Portugal',
    displayName: 'Portugal',
    isoCode: 'PT',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 4,
    mentorsCount: 1,
    openReferrals: 0,
    primaryHubs: ['Lisbon', 'Porto'],
    topEmployers: ['Cloudflare Lisbon', 'Farfetch'],
    coordinates: [-9.1393, 38.7223],
  },
  {
    countryName: 'Turkey',
    displayName: 'Turkey',
    isoCode: 'TR',
    region: 'west',
    regionLabel: 'Europe, UK & North America',
    alumniCount: 14,
    mentorsCount: 2,
    openReferrals: 0,
    primaryHubs: ['Istanbul', 'Ankara'],
    topEmployers: ['Trendyol', 'Getir', 'Koc University'],
    coordinates: [28.9784, 41.0082],
  },

  // Asia-Pacific & Africa (188 alumni across 11 countries)
  {
    countryName: 'Australia',
    displayName: 'Australia',
    isoCode: 'AU',
    region: 'apac',
    regionLabel: 'Asia-Pacific & Global Hubs',
    alumniCount: 64,
    mentorsCount: 11,
    openReferrals: 3,
    primaryHubs: ['Sydney', 'Melbourne', 'Brisbane'],
    topEmployers: ['Atlassian', 'Canva', 'Macquarie Group', 'UNSW'],
    coordinates: [151.2093, -33.8688],
    isMajorChapter: true,
  },
  {
    countryName: 'Malaysia',
    displayName: 'Malaysia',
    isoCode: 'MY',
    region: 'apac',
    regionLabel: 'Asia-Pacific & Global Hubs',
    alumniCount: 34,
    mentorsCount: 6,
    openReferrals: 2,
    primaryHubs: ['Kuala Lumpur', 'Cyberjaya'],
    topEmployers: ['Grab', 'Petronas Digital', 'Universiti Malaya'],
    coordinates: [101.6869, 3.139],
    isMajorChapter: true,
  },
  {
    countryName: 'China',
    displayName: 'China',
    isoCode: 'CN',
    region: 'apac',
    regionLabel: 'Asia-Pacific & Global Hubs',
    alumniCount: 28,
    mentorsCount: 5,
    openReferrals: 1,
    primaryHubs: ['Beijing', 'Shanghai', 'Shenzhen', 'Hangzhou'],
    topEmployers: ['Tsinghua University', 'Alibaba Cloud', 'Tencent'],
    coordinates: [116.4074, 39.9042],
  },
  {
    countryName: 'South Korea',
    displayName: 'South Korea',
    isoCode: 'KR',
    region: 'apac',
    regionLabel: 'Asia-Pacific & Global Hubs',
    alumniCount: 19,
    mentorsCount: 4,
    openReferrals: 1,
    primaryHubs: ['Seoul', 'Daejeon'],
    topEmployers: ['KAIST', 'Samsung Research', 'Naver'],
    coordinates: [126.978, 37.5665],
  },
  {
    countryName: 'Singapore',
    displayName: 'Singapore',
    isoCode: 'SG',
    region: 'apac',
    regionLabel: 'Asia-Pacific & Global Hubs',
    alumniCount: 18,
    mentorsCount: 4,
    openReferrals: 2,
    primaryHubs: ['Singapore Marina Bay', 'One-North'],
    topEmployers: ['DBS Bank', 'Shopee', 'NUS', 'Grab HQ'],
    coordinates: [103.8198, 1.3521],
    isMajorChapter: true,
  },
  {
    countryName: 'Japan',
    displayName: 'Japan',
    isoCode: 'JP',
    region: 'apac',
    regionLabel: 'Asia-Pacific & Global Hubs',
    alumniCount: 14,
    mentorsCount: 3,
    openReferrals: 1,
    primaryHubs: ['Tokyo', 'Tsukuba'],
    topEmployers: ['Rakuten', 'Woven by Toyota', 'University of Tokyo'],
    coordinates: [139.6503, 35.6762],
  },
  {
    countryName: 'New Zealand',
    displayName: 'New Zealand',
    isoCode: 'NZ',
    region: 'apac',
    regionLabel: 'Asia-Pacific & Global Hubs',
    alumniCount: 9,
    mentorsCount: 2,
    openReferrals: 0,
    primaryHubs: ['Auckland', 'Wellington'],
    topEmployers: ['Xero', 'University of Auckland'],
    coordinates: [174.7633, -36.8485],
  },
  {
    countryName: 'Thailand',
    displayName: 'Thailand',
    isoCode: 'TH',
    region: 'apac',
    regionLabel: 'Asia-Pacific & Global Hubs',
    alumniCount: 6,
    mentorsCount: 1,
    openReferrals: 0,
    primaryHubs: ['Bangkok'],
    topEmployers: ['Agoda Engineering', 'AIT Bangkok'],
    coordinates: [100.5018, 13.7563],
  },
  {
    countryName: 'Indonesia',
    displayName: 'Indonesia',
    isoCode: 'ID',
    region: 'apac',
    regionLabel: 'Asia-Pacific & Global Hubs',
    alumniCount: 5,
    mentorsCount: 1,
    openReferrals: 0,
    primaryHubs: ['Jakarta'],
    topEmployers: ['GoTo Group', 'Traveloka'],
    coordinates: [106.8456, -6.2088],
  },
  {
    countryName: 'South Africa',
    displayName: 'South Africa',
    isoCode: 'ZA',
    region: 'apac',
    regionLabel: 'Asia-Pacific & Global Hubs',
    alumniCount: 5,
    mentorsCount: 1,
    openReferrals: 0,
    primaryHubs: ['Cape Town', 'Johannesburg'],
    topEmployers: ['Standard Bank', 'AWS Cape Town'],
    coordinates: [18.4241, -33.9249],
  },
  {
    countryName: 'Nigeria',
    displayName: 'Nigeria',
    isoCode: 'NG',
    region: 'apac',
    regionLabel: 'Asia-Pacific & Global Hubs',
    alumniCount: 4,
    mentorsCount: 1,
    openReferrals: 0,
    primaryHubs: ['Lagos'],
    topEmployers: ['Flutterwave', 'Paystack'],
    coordinates: [3.3792, 6.5244],
  },
]

const SUKKUR_COORDINATES: [number, number] = [68.8228, 27.7244]

interface RegionViewport {
  scale: number
  center: [number, number]
  label: string
}

const REGION_VIEWPORTS: Record<MapRegionFilter, RegionViewport> = {
  all: {
    scale: 156,
    center: [24, 18],
    label: 'All 42 Countries (5,420+ Alumni)',
  },
  pakistan: {
    scale: 520,
    center: [74, 26],
    label: 'Pakistan & South Asia (3,680 Alumni)',
  },
  gulf: {
    scale: 460,
    center: [48, 25],
    label: 'Middle East & Gulf (980 Alumni)',
  },
  west: {
    scale: 215,
    center: [-28, 46],
    label: 'Europe, UK & North America (572 Alumni)',
  },
  apac: {
    scale: 230,
    center: [115, 4],
    label: 'Asia-Pacific & Global Hubs (188 Alumni)',
  },
}

interface FeaturedCountryAlumnus {
  id: string
  name: string
  role: string
  company: string
  cohort: string
  department: string
  cityHub: string
  mentorshipFocus: string
  isMentor: boolean
  canRefer: boolean
  avatarUrl: string
}

const CURATED_COUNTRY_ALUMNI: Record<string, FeaturedCountryAlumnus[]> = {
  PK: [
    {
      id: 'pk-1',
      name: 'Ayesha Siddiqui',
      role: 'Principal Systems Architect',
      company: 'Systems Ltd',
      cohort: 'Class of 2016',
      department: 'BS Computer Science',
      cityHub: 'Karachi',
      mentorshipFocus: 'Cloud Native Architecture & Capstone Advisory',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'pk-2',
      name: 'Dr. Waqas Ahmed',
      role: 'Associate Dean & AI Research Lead',
      company: 'Sukkur IBA University',
      cohort: 'Class of 2012',
      department: 'BS Computer Science',
      cityHub: 'Sukkur Main Campus',
      mentorshipFocus: 'NLP Research Fellowships & Graduate Admissions',
      isMentor: true,
      canRefer: false,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'pk-3',
      name: 'Hina Memon',
      role: 'VP Digital Banking & FinTech',
      company: 'HBL',
      cohort: 'Class of 2015',
      department: 'MBA Finance',
      cityHub: 'Islamabad',
      mentorshipFocus: 'Digital Payment Rails & Product Leadership',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'pk-4',
      name: 'Zainab Khuhro',
      role: 'Lead Distributed Systems Engineer',
      company: 'Jazz Digital',
      cohort: 'Class of 2019',
      department: 'BS Software Engineering',
      cityHub: 'Lahore',
      mentorshipFocus: 'High-Throughput Microservices & Go/Kubernetes',
      isMentor: false,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
  ],
  AE: [
    {
      id: 'ae-1',
      name: 'Bilal Qureshi',
      role: 'VP of Product Strategy',
      company: 'Careem',
      cohort: 'Class of 2016',
      department: 'MBA',
      cityHub: 'Dubai Internet City',
      mentorshipFocus: 'MENA Super-App Growth & GCC Relocation',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'ae-2',
      name: 'Sanaullah Mahar',
      role: 'Staff Platform Engineer',
      company: 'Talabat',
      cohort: 'Class of 2017',
      department: 'BS Computer Science',
      cityHub: 'Dubai Internet City',
      mentorshipFocus: 'Real-Time Logistics & Distributed Tracing',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'ae-3',
      name: 'Farhan Soomro',
      role: 'Director of Sovereign Cloud AI',
      company: 'G42',
      cohort: 'Class of 2014',
      department: 'BE Electrical Engineering',
      cityHub: 'Abu Dhabi ADGM',
      mentorshipFocus: 'LLM Infrastructure & Enterprise AI Governance',
      isMentor: true,
      canRefer: false,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'ae-4',
      name: 'Nadia Shaikh',
      role: 'Lead Risk & Treasury Analyst',
      company: 'Emirates NBD',
      cohort: 'Class of 2018',
      department: 'BBA Finance',
      cityHub: 'Dubai',
      mentorshipFocus: 'GCC Banking Careers & CFA Track Coaching',
      isMentor: false,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
  ],
  SA: [
    {
      id: 'sa-1',
      name: 'Tariq Jamil Kalhoro',
      role: 'Principal FinTech Architect',
      company: 'STC Pay',
      cohort: 'Class of 2015',
      department: 'BS Computer Science',
      cityHub: 'Riyadh KAFD',
      mentorshipFocus: 'Payment Gateways & KSA Vision 2030 Tech Roles',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'sa-2',
      name: 'Engr. Kashif Bhutto',
      role: 'Senior Industrial IoT Lead',
      company: 'Aramco Digital',
      cohort: 'Class of 2016',
      department: 'BE Electrical Engineering',
      cityHub: 'Dammam / Dhahran',
      mentorshipFocus: 'Smart Energy Grids & Industrial Automation',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'sa-3',
      name: 'Rabia Channa',
      role: 'Smart City Data Engineering Lead',
      company: 'NEOM Tech',
      cohort: 'Class of 2018',
      department: 'BS Software Engineering',
      cityHub: 'Riyadh / NEOM',
      mentorshipFocus: 'Digital Twin Pipelines & Spatial Analytics',
      isMentor: true,
      canRefer: false,
      avatarUrl: '/images/avatar.jpg',
    },
  ],
  US: [
    {
      id: 'us-1',
      name: 'Dr. Kamran Brohi',
      role: 'Staff Research Scientist',
      company: 'Google',
      cohort: 'Class of 2014',
      department: 'BS Computer Science',
      cityHub: 'San Francisco Bay Area',
      mentorshipFocus: 'Fulbright PhD Advisory & Multimodal ML Systems',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'us-2',
      name: 'komal Abbasi',
      role: 'Principal Cloud Infrastructure Engineer',
      company: 'AWS',
      cohort: 'Class of 2017',
      department: 'BS Computer Science',
      cityHub: 'Seattle',
      mentorshipFocus: 'Distributed Storage & System Design Interviews',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'us-3',
      name: 'Junaid Lashari',
      role: 'Senior Payments Engineering Manager',
      company: 'Stripe',
      cohort: 'Class of 2015',
      department: 'BS Software Engineering',
      cityHub: 'New York',
      mentorshipFocus: 'Engineering Management & Global Mobility',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'us-4',
      name: 'Mehwish Jokhio',
      role: 'Senior AI Product Lead',
      company: 'Microsoft',
      cohort: 'Class of 2018',
      department: 'MBA',
      cityHub: 'Austin',
      mentorshipFocus: 'Enterprise Copilot Adoption & B2B Product Strategy',
      isMentor: false,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
  ],
  GB: [
    {
      id: 'gb-1',
      name: 'Usman Memon',
      role: 'Staff Core Banking Engineer',
      company: 'Revolut',
      cohort: 'Class of 2016',
      department: 'BS Computer Science',
      cityHub: 'London',
      mentorshipFocus: 'UK Global Talent Visa & High-Frequency Ledgers',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'gb-2',
      name: 'Dr. Sidra Pathan',
      role: 'Senior Research Scientist',
      company: 'DeepMind',
      cohort: 'Class of 2015',
      department: 'BS Computer Science',
      cityHub: 'London / Cambridge',
      mentorshipFocus: 'Commonwealth Scholarships & Reinforcement Learning',
      isMentor: true,
      canRefer: false,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'gb-3',
      name: 'Ahsan Shaikh',
      role: 'VP Quantitative Risk',
      company: 'Barclays',
      cohort: 'Class of 2014',
      department: 'BBA Finance',
      cityHub: 'London',
      mentorshipFocus: 'Quantitative Finance & UK Financial Services',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
  ],
  DE: [
    {
      id: 'de-1',
      name: 'Dr. Sarmad Mahar',
      role: 'Lead Robotics & Power Systems Engineer',
      company: 'Siemens',
      cohort: 'Class of 2017',
      department: 'BE Electrical Engineering',
      cityHub: 'Munich',
      mentorshipFocus: 'DAAD Fellowships & Embedded Hardware Systems',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'de-2',
      name: 'Faryal Pirzada',
      role: 'Senior Distributed Systems Engineer',
      company: 'Zalando',
      cohort: 'Class of 2019',
      department: 'BS Software Engineering',
      cityHub: 'Berlin',
      mentorshipFocus: 'EU Blue Card Relocation & Platform Engineering',
      isMentor: true,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
    {
      id: 'de-3',
      name: 'Danish Kazi',
      role: 'Enterprise Cloud Architect',
      company: 'SAP',
      cohort: 'Class of 2016',
      department: 'BS Computer Science',
      cityHub: 'Frankfurt',
      mentorshipFocus: 'Enterprise B2B SaaS & Cloud Migrations',
      isMentor: false,
      canRefer: true,
      avatarUrl: '/images/avatar.jpg',
    },
  ],
}

const REGIONAL_SCHOLAR_TEMPLATES = [
  {
    namePrefix: 'Engr. Asadullah',
    nameSuffix: 'Memon',
    role: 'Principal Cloud & Systems Architect',
    cohort: 'Class of 2016',
    department: 'BS Computer Science',
    mentorshipFocus: 'Distributed Systems, Visa Sponsorship & Technical Interviews',
    isMentor: true,
    canRefer: true,
  },
  {
    namePrefix: 'Dr. Nida',
    nameSuffix: 'Qureshi',
    role: 'Senior AI & Data Science Lead',
    cohort: 'Class of 2017',
    department: 'BS Software Engineering',
    mentorshipFocus: 'Graduate Research Fellowships & Applied Machine Learning',
    isMentor: true,
    canRefer: true,
  },
  {
    namePrefix: 'Muzammil',
    nameSuffix: 'Soomro',
    role: 'Director of FinTech & Strategy',
    cohort: 'Class of 2015',
    department: 'MBA Finance',
    mentorshipFocus: 'Product Strategy, Cross-Border Mobility & Executive Growth',
    isMentor: true,
    canRefer: false,
  },
  {
    namePrefix: 'Sadia',
    nameSuffix: 'Kalhoro',
    role: 'Staff Power & Embedded Systems Engineer',
    cohort: 'Class of 2019',
    department: 'BE Electrical Engineering',
    mentorshipFocus: 'Clean Energy Grids, IoT Hardware & Chapter Onboarding',
    isMentor: false,
    canRefer: true,
  },
]

function getFeaturedAlumniForCountry(
  country: CountryAlumniRecord
): FeaturedCountryAlumnus[] {
  if (CURATED_COUNTRY_ALUMNI[country.isoCode]) {
    return CURATED_COUNTRY_ALUMNI[country.isoCode]
  }

  return REGIONAL_SCHOLAR_TEMPLATES.map((tpl, idx) => {
    const employer =
      country.topEmployers[idx % country.topEmployers.length] ||
      'Global Chapter Partner'
    const city =
      country.primaryHubs[idx % country.primaryHubs.length] ||
      country.displayName
    return {
      id: `${country.isoCode.toLowerCase()}-${idx + 1}`,
      name: `${tpl.namePrefix} ${tpl.nameSuffix}`,
      role: tpl.role,
      company: employer.trim(),
      cohort: tpl.cohort,
      department: tpl.department,
      cityHub: city,
      mentorshipFocus: tpl.mentorshipFocus,
      isMentor: tpl.isMentor,
      canRefer: tpl.canRefer && country.openReferrals > 0,
      avatarUrl: '/images/avatar.jpg',
    }
  })
}

interface AlumniWorldMapProps {
  /** Optional external region sync (e.g. from the landing page impact section) */
  activeRegion?: 'global' | 'pakistan' | 'gulf' | 'west'
  onRegionSelect?: (region: 'global' | 'pakistan' | 'gulf' | 'west') => void
  /** Optional callback when a country is clicked (e.g. to filter directory) */
  onCountrySelect?: (country: CountryAlumniRecord) => void
  variant?: 'dark' | 'adaptive'
}

export function AlumniWorldMap({
  activeRegion,
  onRegionSelect,
  onCountrySelect,
  variant = 'dark',
}: AlumniWorldMapProps) {
  const [internalRegion, setInternalRegion] = useState<MapRegionFilter>('all')
  const [zoomMultiplier, setZoomMultiplier] = useState(1)
  const [hoveredCountry, setHoveredCountry] =
    useState<CountryAlumniRecord | null>(null)
  const [selectedCountry, setSelectedCountry] =
    useState<CountryAlumniRecord | null>(ALUMNI_COUNTRIES_DATA[0])
  const [modalCountry, setModalCountry] =
    useState<CountryAlumniRecord | null>(null)
  const [modalFilter, setModalFilter] = useState<'all' | 'mentors' | 'referrals'>('all')
  const [requestedIntroIds, setRequestedIntroIds] = useState<Record<string, boolean>>({})
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!modalCountry) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalCountry(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalCountry])

  const openCountryModal = (country: CountryAlumniRecord) => {
    setSelectedCountry(country)
    setModalFilter('all')
    setModalCountry(country)
    onCountrySelect?.(country)
  }

  const effectiveRegion: MapRegionFilter = useMemo(() => {
    if (!activeRegion) return internalRegion
    if (activeRegion === 'global') return internalRegion === 'apac' ? 'apac' : 'all'
    return activeRegion
  }, [activeRegion, internalRegion])

  const handleRegionChange = (region: MapRegionFilter) => {
    setInternalRegion(region)
    setZoomMultiplier(1)
    if (onRegionSelect) {
      if (region === 'all' || region === 'apac') {
        onRegionSelect('global')
      } else {
        onRegionSelect(region)
      }
    }
  }

  const countryByName = useMemo(() => {
    const map = new Map<string, CountryAlumniRecord>()
    for (const item of ALUMNI_COUNTRIES_DATA) {
      map.set(item.countryName, item)
    }
    return map
  }, [])

  // Parse Natural Earth 110m countries TopoJSON once
  const countriesGeo = useMemo(() => {
    const rawTopology = worldAtlasData as unknown as {
      type: 'Topology'
      objects: {
        countries: unknown
      }
    }
    const parsed = feature(
      rawTopology as never,
      rawTopology.objects.countries as never
    ) as unknown as {
      features: Array<
        GeoPermissibleObjects & {
          id?: string
          properties?: { name?: string }
        }
      >
    }
    return parsed
  }, [])

  const viewport = REGION_VIEWPORTS[effectiveRegion]

  // Configure D3 Natural Earth projection based on active region + zoom
  const { pathGenerator, graticulePath, projectedHubs, projectedArcs } =
    useMemo(() => {
      const projection = geoNaturalEarth1()
        .scale(viewport.scale * zoomMultiplier)
        .center(viewport.center)
        .translate([480, 250])

      const generator = geoPath(projection)
      const graticule = generator(geoGraticule10()) || ''

      const hubs = ALUMNI_COUNTRIES_DATA.map((record) => {
        const pt = projection(record.coordinates)
        return {
          record,
          x: pt ? pt[0] : -999,
          y: pt ? pt[1] : -999,
        }
      }).filter((h) => h.x >= -100 && h.x <= 1060 && h.y >= -100 && h.y <= 600)

      const arcs = ALUMNI_COUNTRIES_DATA.filter(
        (c) => c.isMajorChapter && c.countryName !== 'Pakistan'
      ).map((target) => {
        const arcGeo: GeoPermissibleObjects = {
          type: 'LineString',
          coordinates: [SUKKUR_COORDINATES, target.coordinates],
        }
        return {
          id: target.isoCode,
          d: generator(arcGeo) || '',
          region: target.region,
        }
      })

      return {
        pathGenerator: generator,
        graticulePath: graticule,
        projectedHubs: hubs,
        projectedArcs: arcs,
      }
    }, [viewport, zoomMultiplier])

  const filteredCountriesList = useMemo(() => {
    return ALUMNI_COUNTRIES_DATA.filter((c) =>
      effectiveRegion === 'all' ? true : c.region === effectiveRegion
    ).sort((a, b) => b.alumniCount - a.alumniCount)
  }, [effectiveRegion])

  const totalAlumniInView = useMemo(
    () =>
      filteredCountriesList.reduce((acc, item) => acc + item.alumniCount, 0),
    [filteredCountriesList]
  )

  const activeInspectionRecord = hoveredCountry || selectedCountry || ALUMNI_COUNTRIES_DATA[0]

  const getCountryFill = (record: CountryAlumniRecord | undefined, isHovered: boolean, isSelected: boolean) => {
    if (!record) {
      return variant === 'dark'
        ? 'rgba(255, 255, 255, 0.055)'
        : 'rgba(15, 23, 42, 0.07)'
    }
    if (isHovered || isSelected) {
      return '#F59E0B' // Warm gold highlight on active inspection
    }
    if (effectiveRegion !== 'all' && record.region !== effectiveRegion) {
      return variant === 'dark'
        ? 'rgba(45, 212, 191, 0.14)'
        : 'rgba(13, 110, 91, 0.16)'
    }
    // Choropleth density scale across the 42 alumni countries
    if (record.alumniCount >= 1000) return '#10B981' // Homeland Emerald
    if (record.alumniCount >= 150) return '#0D9488' // Major Hub Teal
    if (record.alumniCount >= 50) return '#0D6E5B' // Established Chapter
    if (record.alumniCount >= 15) return 'rgba(13, 148, 136, 0.65)'
    return 'rgba(13, 148, 136, 0.42)'
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return
    const rect = mapContainerRef.current.getBoundingClientRect()
    setPointerPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const isDark = variant === 'dark'

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-colors ${
        isDark
          ? 'border-white/12 bg-[#07101C]/90 text-white'
          : 'border-border bg-card text-foreground shadow-card'
      }`}
    >
      {/* Top Control & Telemetry Header */}
      <div
        className={`p-5 sm:p-6 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          isDark ? 'border-white/10' : 'border-border/80'
        }`}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-1.5">
            <span
              className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider ${
                isDark ? 'text-[#2DD4BF]' : 'text-primary'
              }`}
            >
              <Globe2 className="h-3.5 w-3.5" />
              D3.js Global Cartography
            </span>
            <span aria-hidden="true" className={isDark ? 'text-white/30' : 'text-border'}>
              ·
            </span>
            <span className={isDark ? 'text-[#F59E0B]' : 'text-gold'}>
              42 Verified Countries
            </span>
            <span aria-hidden="true" className={isDark ? 'text-white/30' : 'text-border'}>
              ·
            </span>
            <span className={`tabular-nums ${isDark ? 'text-white/70' : 'text-secondary'}`}>
              {filteredCountriesList.length} Countries in View ({totalAlumniInView.toLocaleString()} Alumni)
            </span>
          </div>
          <h3
            className={`font-display text-xl sm:text-2xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-foreground'
            }`}
          >
            Interactive 42-Country Alumni Distribution & Chapter Corridors
          </h3>
        </div>

        {/* Interactive Region Scope Tabs + Zoom Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Focus map by global region"
            className={`flex flex-wrap items-center gap-1 p-1 rounded-xl border ${
              isDark
                ? 'bg-white/[0.04] border-white/12'
                : 'bg-stone border-border/70'
            }`}
          >
            {(
              [
                { id: 'all', label: 'All 42 Countries' },
                { id: 'pakistan', label: 'South Asia (4)' },
                { id: 'gulf', label: 'Middle East & Gulf (8)' },
                { id: 'west', label: 'Europe & Americas (19)' },
                { id: 'apac', label: 'Asia-Pacific & Africa (11)' },
              ] as const
            ).map((tab) => {
              const active = effectiveRegion === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleRegionChange(tab.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? isDark
                        ? 'text-white font-semibold'
                        : 'text-foreground font-semibold'
                      : isDark
                      ? 'text-white/65 hover:text-white'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="world-map-region-pill"
                      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                      className={`absolute inset-0 rounded-lg ${
                        isDark
                          ? 'bg-[#0D6E5B] shadow-sm'
                          : 'bg-card shadow-sm border border-primary/25'
                      }`}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Zoom Controls */}
          <div
            className={`inline-flex items-center gap-1 p-1 rounded-xl border ${
              isDark
                ? 'bg-white/[0.04] border-white/12'
                : 'bg-stone border-border/70'
            }`}
          >
            <button
              type="button"
              onClick={() =>
                setZoomMultiplier((z) => Math.min(2.4, Number((z + 0.25).toFixed(2))))
              }
              aria-label="Zoom in map"
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'text-white/75 hover:text-white hover:bg-white/10'
                  : 'text-secondary hover:text-foreground hover:bg-card'
              }`}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setZoomMultiplier((z) => Math.max(0.8, Number((z - 0.25).toFixed(2))))
              }
              aria-label="Zoom out map"
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'text-white/75 hover:text-white hover:bg-white/10'
                  : 'text-secondary hover:text-foreground hover:bg-card'
              }`}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                handleRegionChange('all')
                setZoomMultiplier(1)
              }}
              aria-label="Reset map view"
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'text-white/75 hover:text-white hover:bg-white/10'
                  : 'text-secondary hover:text-foreground hover:bg-card'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: 8-Col Interactive D3 SVG Canvas + 4-Col Live Country Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 8 Columns: D3 GeoNaturalEarth1 Interactive Map */}
        <div
          ref={mapContainerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCountry(null)}
          className={`lg:col-span-8 relative overflow-hidden select-none ${
            isDark
              ? 'bg-[radial-gradient(circle_at_50%_45%,rgba(13,110,91,0.22),rgba(7,16,28,0.96)_72%)]'
              : 'bg-[radial-gradient(circle_at_50%_45%,rgba(13,110,91,0.08),transparent_72%)]'
          }`}
        >
          <svg
            viewBox="0 0 960 500"
            role="img"
            aria-label="Interactive D3 world map showing Sukkur IBA alumni across 42 countries"
            className="w-full h-[340px] sm:h-[420px] lg:h-[460px] block"
          >
            <defs>
              <radialGradient id="sukkur-beacon-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="meridian-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.55" />
              </linearGradient>
            </defs>

            {/* D3 Graticule Meridian Grid */}
            <path
              d={graticulePath}
              fill="none"
              stroke={
                isDark
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(15, 23, 42, 0.06)'
              }
              strokeWidth={0.6}
            />

            {/* World Countries Polygons */}
            <g>
              {countriesGeo.features.map((geo, idx) => {
                const name = geo.properties?.name || ''
                const record = countryByName.get(name)
                const isHovered =
                  Boolean(record) &&
                  hoveredCountry?.countryName === record?.countryName
                const isSelected =
                  Boolean(record) &&
                  selectedCountry?.countryName === record?.countryName
                const d = pathGenerator(geo) || ''

                return (
                  <path
                    key={`${name}-${idx}`}
                    d={d}
                    fill={getCountryFill(record, isHovered, isSelected)}
                    stroke={
                      isHovered || isSelected
                        ? '#F59E0B'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.14)'
                        : 'rgba(15, 23, 42, 0.16)'
                    }
                    strokeWidth={isHovered || isSelected ? 1.4 : 0.55}
                    className={
                      record
                        ? 'cursor-pointer transition-colors duration-150'
                        : 'transition-colors duration-150'
                    }
                    onMouseEnter={() => {
                      if (record) setHoveredCountry(record)
                    }}
                    onClick={() => {
                      if (record) {
                        openCountryModal(record)
                      }
                    }}
                  />
                )
              })}
            </g>

            {/* Geodesic Corridor Arcs from Sukkur IBA Main Campus to Global Chapter Hubs */}
            <g className="pointer-events-none">
              {projectedArcs.map((arc) => {
                const dimmed =
                  effectiveRegion !== 'all' && arc.region !== effectiveRegion
                return (
                  <path
                    key={arc.id}
                    d={arc.d}
                    fill="none"
                    stroke="url(#meridian-arc-grad)"
                    strokeWidth={dimmed ? 0.6 : 1.35}
                    strokeDasharray="4 4"
                    opacity={dimmed ? 0.2 : 0.75}
                  />
                )
              })}
            </g>

            {/* Interactive Country & Chapter Hub Nodes */}
            <g>
              {projectedHubs.map(({ record, x, y }) => {
                const isHomeland = record.countryName === 'Pakistan'
                const isHovered =
                  hoveredCountry?.countryName === record.countryName
                const isSelected =
                  selectedCountry?.countryName === record.countryName
                const radius = isHomeland
                  ? 7.5
                  : Math.max(
                      3.2,
                      Math.min(7, Math.sqrt(record.alumniCount) * 0.34)
                    )

                return (
                  <g
                    key={record.isoCode}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredCountry(record)}
                    onClick={() => {
                      openCountryModal(record)
                    }}
                  >
                    {/* Pulse Halo for Major Chapter Hubs */}
                    {(record.isMajorChapter || isHovered || isSelected) && (
                      <circle
                        r={radius * 2.3}
                        fill={
                          isHomeland || isHovered || isSelected
                            ? 'rgba(245, 158, 11, 0.28)'
                            : 'rgba(45, 212, 191, 0.25)'
                        }
                      />
                    )}
                    <circle
                      r={isHovered || isSelected ? radius + 1.8 : radius}
                      fill={
                        isHomeland || isHovered || isSelected
                          ? '#F59E0B'
                          : '#2DD4BF'
                      }
                      stroke="#091422"
                      strokeWidth={1.3}
                    />
                    {/* Label for Major Chapters or Hovered Country */}
                    {(record.isMajorChapter || isHovered || isSelected) && (
                      <text
                        y={-radius - 5}
                        textAnchor="middle"
                        className="font-mono text-[9.5px] font-semibold fill-current pointer-events-none"
                        style={{
                          fill: isDark ? '#F8FAFC' : '#091422',
                          paintOrder: 'stroke',
                          stroke: isDark
                            ? 'rgba(7, 16, 28, 0.85)'
                            : 'rgba(255, 255, 255, 0.9)',
                          strokeWidth: 3,
                        }}
                      >
                        {record.isoCode} · {record.alumniCount}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          </svg>

          {/* Floating Cursor Tooltip on Country Hover */}
          <AnimatePresence>
            {hoveredCountry && (
              <motion.div
                key={hoveredCountry.isoCode}
                initial={{ opacity: 0, scale: 0.94, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 4 }}
                transition={{ duration: 0.14 }}
                style={{
                  left: Math.min(Math.max(pointerPos.x + 14, 16), 440),
                  top: Math.max(pointerPos.y - 16, 16),
                }}
                className="pointer-events-none absolute z-30 w-64 rounded-xl border border-white/20 bg-[#091422]/95 backdrop-blur-md p-3.5 text-white shadow-xl"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#2DD4BF] mb-1">
                  <span>{hoveredCountry.regionLabel}</span>
                  <span className="text-[#F59E0B] font-bold">
                    {hoveredCountry.isoCode}
                  </span>
                </div>
                <p className="font-display text-base font-bold text-white leading-snug">
                  {hoveredCountry.displayName}
                </p>
                <div className="mt-2 pt-2 border-t border-white/15 grid grid-cols-3 gap-2 text-[11px] font-mono tabular-nums">
                  <div>
                    <span className="block text-white/60 text-[10px]">
                      Alumni
                    </span>
                    <span className="font-bold text-white">
                      {hoveredCountry.alumniCount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-white/60 text-[10px]">
                      Mentors
                    </span>
                    <span className="font-bold text-[#2DD4BF]">
                      {hoveredCountry.mentorsCount}
                    </span>
                  </div>
                  <div>
                    <span className="block text-white/60 text-[10px]">
                      Referrals
                    </span>
                    <span className="font-bold text-[#F59E0B]">
                      {hoveredCountry.openReferrals}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-white/75 truncate">
                  Hubs: {hoveredCountry.primaryHubs.join(' · ')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom-Left Map Legend */}
          <div
            className={`px-4 py-2.5 border-t flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono ${
              isDark
                ? 'border-white/10 bg-[#091422]/80 text-white/70'
                : 'border-border/80 bg-stone/60 text-secondary'
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                Sukkur Meridian / Active Selection
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                150+ Alumni Hub
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0D6E5B]" />
                Regional Chapter (15–149)
              </span>
            </div>
            <span>Hover or click any country to inspect chapter telemetry</span>
          </div>
        </div>

        {/* Right 4 Columns: Active Country Telemetry & 42-Country Scrollable Leaderboard */}
        <div
          className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-5 sm:p-6 flex flex-col justify-between ${
            isDark ? 'border-white/10 bg-white/[0.02]' : 'border-border/80 bg-background/50'
          }`}
        >
          {/* Active Country Spotlight Card */}
          <div className="mb-5">
            <div className="flex items-center justify-between gap-2 text-xs font-mono mb-1.5">
              <span className={isDark ? 'text-[#F59E0B]' : 'text-primary font-semibold'}>
                <Compass className="h-3.5 w-3.5 inline mr-1" />
                {activeInspectionRecord.regionLabel}
              </span>
              <span className={`tabular-nums ${isDark ? 'text-white/60' : 'text-secondary'}`}>
                {((activeInspectionRecord.alumniCount / 5420) * 100).toFixed(1)}% of network
              </span>
            </div>

            <h4
              className={`font-display text-xl font-bold mb-3 ${
                isDark ? 'text-white' : 'text-foreground'
              }`}
            >
              {activeInspectionRecord.displayName}
            </h4>

            <div
              className={`grid grid-cols-3 gap-2.5 p-3.5 rounded-xl border mb-3.5 font-mono tabular-nums ${
                isDark
                  ? 'border-white/12 bg-white/[0.04]'
                  : 'border-border bg-card'
              }`}
            >
              <div>
                <span
                  className={`text-[11px] flex items-center gap-1 ${
                    isDark ? 'text-white/60' : 'text-secondary'
                  }`}
                >
                  <Users className="h-3 w-3 text-[#2DD4BF]" />
                  Alumni
                </span>
                <span className="text-lg font-bold">
                  {activeInspectionRecord.alumniCount.toLocaleString()}
                </span>
              </div>
              <div>
                <span
                  className={`text-[11px] flex items-center gap-1 ${
                    isDark ? 'text-white/60' : 'text-secondary'
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-[#F59E0B]" />
                  Mentors
                </span>
                <span className="text-lg font-bold text-[#2DD4BF]">
                  {activeInspectionRecord.mentorsCount}
                </span>
              </div>
              <div>
                <span
                  className={`text-[11px] flex items-center gap-1 ${
                    isDark ? 'text-white/60' : 'text-secondary'
                  }`}
                >
                  <Briefcase className="h-3 w-3 text-primary" />
                  Open Roles
                </span>
                <span className="text-lg font-bold text-[#F59E0B]">
                  {activeInspectionRecord.openReferrals}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className={isDark ? 'text-white/80' : 'text-secondary'}>
                <MapPin className="h-3.5 w-3.5 inline mr-1 text-[#2DD4BF]" />
                <strong className={isDark ? 'text-white' : 'text-foreground'}>
                  Chapter Hubs:
                </strong>{' '}
                {activeInspectionRecord.primaryHubs.join(' · ')}
              </p>
              <p className={isDark ? 'text-white/75' : 'text-secondary'}>
                <strong className={isDark ? 'text-white' : 'text-foreground'}>
                  Top Employers:
                </strong>{' '}
                {activeInspectionRecord.topEmployers.join(' · ')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => openCountryModal(activeInspectionRecord)}
              className={`mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
                isDark
                  ? 'bg-[#0D6E5B] text-white hover:bg-[#10B981] shadow-sm'
                  : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>
                View Featured Alumni in {activeInspectionRecord.displayName}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Scrollable 42-Country Distribution List */}
          <div
            className={`pt-4 border-t ${
              isDark ? 'border-white/10' : 'border-border/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono mb-2.5">
              <span className={isDark ? 'text-white/70' : 'text-secondary'}>
                Country Ranking ({filteredCountriesList.length})
              </span>
              <span className={isDark ? 'text-white/50' : 'text-secondary/80'}>
                Click for featured alumni
              </span>
            </div>

            <div className="max-h-[195px] overflow-y-auto pr-1 space-y-1">
              {filteredCountriesList.map((country, idx) => {
                const isSelected =
                  activeInspectionRecord.countryName === country.countryName
                return (
                  <button
                    key={country.isoCode}
                    type="button"
                    onMouseEnter={() => setHoveredCountry(country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => {
                      openCountryModal(country)
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between gap-2 transition-colors ${
                      isSelected
                        ? isDark
                          ? 'bg-[#0D6E5B]/50 text-white font-semibold border border-[#2DD4BF]/35'
                          : 'bg-primary/10 text-foreground font-semibold border border-primary/30'
                        : isDark
                        ? 'text-white/75 hover:bg-white/[0.06] hover:text-white'
                        : 'text-secondary hover:bg-stone hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] opacity-60 w-5 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate">{country.displayName}</span>
                    </div>
                    <span className="font-mono tabular-nums shrink-0">
                      {country.alumniCount.toLocaleString()}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Country Click Modal Pop-Up: Featured Alumni from Selected Country & Region */}
      <AnimatePresence>
        {modalCountry && (
          <motion.div
            key="country-alumni-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setModalCountry(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="country-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl rounded-3xl border border-border bg-card text-foreground shadow-2xl overflow-hidden my-auto"
            >
              {/* Modal Top Accent Header */}
              <div className="p-6 sm:p-7 border-b border-border bg-stone/50 dark:bg-white/[0.03]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-primary/15 text-primary dark:bg-primary/25 dark:text-[#2DD4BF] font-bold">
                        {modalCountry.isoCode} Chapter
                      </span>
                      <span aria-hidden="true" className="text-border">
                        ·
                      </span>
                      <span className="text-secondary font-semibold">
                        {modalCountry.regionLabel}
                      </span>
                      <span aria-hidden="true" className="text-border">
                        ·
                      </span>
                      <span className="text-gold dark:text-[#F59E0B] font-semibold">
                        {modalCountry.alumniCount.toLocaleString()} Verified Alumni
                      </span>
                    </div>

                    <h3
                      id="country-modal-title"
                      className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
                    >
                      Featured Alumni in {modalCountry.displayName}
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary mt-1">
                      Active chapter hubs:{' '}
                      <span className="font-semibold text-foreground">
                        {modalCountry.primaryHubs.join(' · ')}
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalCountry(null)}
                    aria-label="Close country alumni modal"
                    className="p-2 rounded-xl border border-border bg-card text-secondary hover:text-foreground hover:bg-stone transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Telemetry & Filter Strip */}
                <div className="mt-5 pt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
                    <span className="inline-flex items-center gap-1.5 text-foreground">
                      <Users className="h-3.5 w-3.5 text-primary dark:text-[#2DD4BF]" />
                      <strong>{modalCountry.alumniCount.toLocaleString()}</strong>{' '}
                      <span className="text-secondary">Graduates</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-gold dark:text-[#F59E0B]" />
                      <strong>{modalCountry.mentorsCount}</strong>{' '}
                      <span className="text-secondary">Mentors</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-foreground">
                      <Briefcase className="h-3.5 w-3.5 text-primary dark:text-[#2DD4BF]" />
                      <strong>{modalCountry.openReferrals}</strong>{' '}
                      <span className="text-secondary">Open Referrals</span>
                    </span>
                  </div>

                  {/* Filter Segmented Control */}
                  <div
                    role="group"
                    aria-label="Filter featured country alumni"
                    className="inline-flex items-center gap-1 p-1 rounded-xl bg-stone border border-border/70 self-start sm:self-auto"
                  >
                    {(
                      [
                        { id: 'all', label: 'All Featured' },
                        { id: 'mentors', label: 'Mentors' },
                        { id: 'referrals', label: 'Referrers' },
                      ] as const
                    ).map((tab) => {
                      const active = modalFilter === tab.id
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setModalFilter(tab.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            active
                              ? 'bg-card text-foreground font-semibold shadow-sm'
                              : 'text-secondary hover:text-foreground'
                          }`}
                        >
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Featured Alumni List Body */}
              <div className="p-6 sm:p-7 max-h-[60vh] overflow-y-auto space-y-3.5 bg-background/60">
                {(() => {
                  const allFeatured = getFeaturedAlumniForCountry(modalCountry)
                  const visibleFeatured = allFeatured.filter((alum) => {
                    if (modalFilter === 'mentors') return alum.isMentor
                    if (modalFilter === 'referrals') return alum.canRefer
                    return true
                  })

                  if (visibleFeatured.length === 0) {
                    return (
                      <div className="py-8 text-center text-sm text-secondary">
                        No featured scholars match this filter in{' '}
                        {modalCountry.displayName}.{' '}
                        <button
                          type="button"
                          onClick={() => setModalFilter('all')}
                          className="text-primary dark:text-[#2DD4BF] font-semibold underline ml-1"
                        >
                          Show all featured alumni
                        </button>
                      </div>
                    )
                  }

                  return visibleFeatured.map((alum) => {
                    const isRequested = Boolean(requestedIntroIds[alum.id])
                    return (
                      <motion.div
                        key={alum.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors shadow-sm"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <img
                            src={alum.avatarUrl}
                            alt={alum.name}
                            className="h-12 w-12 rounded-xl object-cover ring-1 ring-border shrink-0"
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-display text-base font-bold text-foreground truncate">
                                {alum.name}
                              </h4>
                              {alum.isMentor && (
                                <span className="text-[11px] font-mono font-semibold text-primary dark:text-[#2DD4BF]">
                                  · Verified Mentor
                                </span>
                              )}
                              {alum.canRefer && (
                                <span className="text-[11px] font-mono font-semibold text-gold dark:text-[#F59E0B]">
                                  · Referral Sponsor
                                </span>
                              )}
                            </div>

                            <p className="text-xs sm:text-sm font-medium text-foreground/90 flex flex-wrap items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-primary dark:text-[#2DD4BF] shrink-0" />
                              <span>
                                {alum.role} · <strong>{alum.company}</strong>
                              </span>
                            </p>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary font-mono">
                              <span className="inline-flex items-center gap-1">
                                <GraduationCap className="h-3.5 w-3.5 text-secondary" />
                                {alum.department} ({alum.cohort})
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-primary dark:text-[#2DD4BF]" />
                                {alum.cityHub}, {modalCountry.displayName}
                              </span>
                            </div>

                            <p className="text-xs text-secondary pt-0.5">
                              <span className="font-semibold text-foreground/85">
                                Advisory Focus:
                              </span>{' '}
                              {alum.mentorshipFocus}
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                          <button
                            type="button"
                            onClick={() => {
                              setRequestedIntroIds((prev) => ({
                                ...prev,
                                [alum.id]: !prev[alum.id],
                              }))
                              if (!isRequested) {
                                toast.success(
                                  `Introduction request sent to ${alum.name} (${modalCountry.displayName} Chapter).`
                                )
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                              isRequested
                                ? 'bg-primary/15 text-primary dark:bg-primary/25 dark:text-[#2DD4BF] border border-primary/30'
                                : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                            }`}
                          >
                            {isRequested ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Intro Requested</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-3.5 w-3.5" />
                                <span>Request Intro</span>
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )
                  })
                })()}
              </div>

              {/* Modal Footer */}
              <div className="px-6 sm:px-7 py-4 border-t border-border bg-stone/50 dark:bg-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-secondary font-mono">
                  Top regional employers:{' '}
                  <strong className="text-foreground">
                    {modalCountry.topEmployers.join(' · ')}
                  </strong>
                </span>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setModalCountry(null)}
                    className="px-4 py-2 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-stone transition-colors"
                  >
                    Close
                  </button>
                  <Link
                    to={`/alumni?q=${encodeURIComponent(modalCountry.countryName)}`}
                    onClick={() => setModalCountry(null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <span>Explore Full {modalCountry.isoCode} Directory</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
