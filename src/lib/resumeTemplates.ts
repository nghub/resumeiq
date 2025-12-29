export type TemplateId = 'classic' | 'modern' | 'executive' | 'tech' | 'corporate-navy' | 'azure-minimal' | 'sapphire-sidebar' | 'royal-rightrail';

export interface ResumeTemplate {
  id: TemplateId;
  name: string;
  description: string;
  previewImage: string;
  fontFamily: {
    name: string;
    body: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    muted: string;
  };
  spacing: 'compact' | 'comfortable';
  layout?: 'single-column' | 'sidebar-left' | 'sidebar-right';
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Clean traditional layout with black text and simple section dividers',
    previewImage: 'classic',
    fontFamily: {
      name: 'Arial',
      body: 'Arial, sans-serif',
    },
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      text: '#000000',
      muted: '#666666',
    },
    spacing: 'comfortable',
    layout: 'single-column',
  },
  {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Contemporary with teal accents and clean skill badges',
    previewImage: 'modern',
    fontFamily: {
      name: 'Calibri',
      body: 'Calibri, sans-serif',
    },
    colors: {
      primary: '#0d9488',
      secondary: '#115e59',
      accent: '#14b8a6',
      text: '#1f2937',
      muted: '#6b7280',
    },
    spacing: 'comfortable',
    layout: 'single-column',
  },
  {
    id: 'executive',
    name: 'Executive Bold',
    description: 'Strong headers with two-tone design and highlighted sections',
    previewImage: 'executive',
    fontFamily: {
      name: 'Georgia',
      body: 'Georgia, serif',
    },
    colors: {
      primary: '#1e3a5f',
      secondary: '#2c5282',
      accent: '#3182ce',
      text: '#1a202c',
      muted: '#4a5568',
    },
    spacing: 'compact',
    layout: 'single-column',
  },
  {
    id: 'tech',
    name: 'Tech Simple',
    description: 'Developer-focused with categorized skills and lots of white space',
    previewImage: 'tech',
    fontFamily: {
      name: 'Consolas',
      body: 'Consolas, monospace',
    },
    colors: {
      primary: '#374151',
      secondary: '#4b5563',
      accent: '#0ea5e9',
      text: '#111827',
      muted: '#6b7280',
    },
    spacing: 'comfortable',
    layout: 'single-column',
  },
  {
    id: 'corporate-navy',
    name: 'Corporate Navy',
    description: 'Full-width navy header with white text, blue section headers',
    previewImage: 'corporate-navy',
    fontFamily: {
      name: 'Arial',
      body: 'Arial, sans-serif',
    },
    colors: {
      primary: '#0F172A',
      secondary: '#2563EB',
      accent: '#3B82F6',
      text: '#0F172A',
      muted: '#64748B',
    },
    spacing: 'comfortable',
    layout: 'single-column',
  },
  {
    id: 'azure-minimal',
    name: 'Azure Minimal',
    description: 'White header with large blue name, centered contact info',
    previewImage: 'azure-minimal',
    fontFamily: {
      name: 'Calibri',
      body: 'Calibri, sans-serif',
    },
    colors: {
      primary: '#2563EB',
      secondary: '#0F172A',
      accent: '#EFF6FF',
      text: '#0F172A',
      muted: '#64748B',
    },
    spacing: 'comfortable',
    layout: 'single-column',
  },
  {
    id: 'sapphire-sidebar',
    name: 'Sapphire Sidebar',
    description: 'Navy left sidebar with contact, skills & education',
    previewImage: 'sapphire-sidebar',
    fontFamily: {
      name: 'Arial',
      body: 'Arial, sans-serif',
    },
    colors: {
      primary: '#0F172A',
      secondary: '#2563EB',
      accent: '#3B82F6',
      text: '#0F172A',
      muted: '#64748B',
    },
    spacing: 'compact',
    layout: 'sidebar-left',
  },
  {
    id: 'royal-rightrail',
    name: 'Royal Right-Rail',
    description: 'Light blue right sidebar with contact, skills & education',
    previewImage: 'royal-rightrail',
    fontFamily: {
      name: 'Arial',
      body: 'Arial, sans-serif',
    },
    colors: {
      primary: '#2563EB',
      secondary: '#0F172A',
      accent: '#EFF6FF',
      text: '#0F172A',
      muted: '#64748B',
    },
    spacing: 'compact',
    layout: 'sidebar-right',
  },
];

export interface TemplateCustomization {
  colorScheme: 'blue' | 'teal' | 'gray' | 'black' | 'navy';
  fontFamily: 'arial' | 'calibri' | 'georgia' | 'times';
  spacing: 'compact' | 'comfortable';
  showCertifications: boolean;
  showLanguages: boolean;
  showVolunteer: boolean;
}

export const defaultCustomization: TemplateCustomization = {
  colorScheme: 'teal',
  fontFamily: 'arial',
  spacing: 'comfortable',
  showCertifications: true,
  showLanguages: false,
  showVolunteer: false,
};

export const colorSchemes = {
  blue: { primary: '#1e3a5f', secondary: '#2c5282', accent: '#3182ce', text: '#1a202c', muted: '#4a5568' },
  teal: { primary: '#0d9488', secondary: '#115e59', accent: '#14b8a6', text: '#1f2937', muted: '#6b7280' },
  gray: { primary: '#374151', secondary: '#4b5563', accent: '#6b7280', text: '#111827', muted: '#6b7280' },
  black: { primary: '#000000', secondary: '#333333', accent: '#666666', text: '#000000', muted: '#666666' },
  navy: { primary: '#0F172A', secondary: '#2563EB', accent: '#3B82F6', text: '#0F172A', muted: '#64748B' },
};

export const fontFamilies = {
  arial: 'Arial, sans-serif',
  calibri: 'Calibri, sans-serif',
  georgia: 'Georgia, serif',
  times: 'Times New Roman, serif',
};
