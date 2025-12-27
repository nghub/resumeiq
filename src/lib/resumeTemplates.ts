export type TemplateId = 'classic' | 'modern' | 'executive' | 'tech';

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
  },
];

export interface TemplateCustomization {
  colorScheme: 'blue' | 'teal' | 'gray' | 'black';
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
};

export const fontFamilies = {
  arial: 'Arial, sans-serif',
  calibri: 'Calibri, sans-serif',
  georgia: 'Georgia, serif',
  times: 'Times New Roman, serif',
};
