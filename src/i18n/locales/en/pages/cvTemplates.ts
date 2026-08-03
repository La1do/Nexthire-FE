export const cvTemplates = {
  routeLabel: 'CV templates',
  hero: {
    inventoryLabel: '1 live template · PDF export in the builder',
    title: 'Start with a hiring-ready CV template',
    description:
      'Choose a template that is already wired to the builder, edit the content around your profile, and export a PDF when it is ready to send.',
    primaryAction: 'Use Professional',
    secondaryAction: 'Browse templates',
  },
  stats: {
    readyTemplates: '{{count}} ready template',
    categoryGroups: '{{count}} category groups',
    exportReady: 'PDF export in builder',
  },
  filters: {
    label: 'Filter CV templates by career group',
    countLabel: '{{count}} templates',
    emptyTitle: 'No matching template yet',
    emptyDescription: 'Try “All” or check back when NexHire opens more templates.',
  },
  categories: {
    all: 'All',
    it: 'Information technology',
    marketing: 'Marketing / PR',
    sales: 'Sales / Business',
    hr: 'Human resources / Admin',
  },
  card: {
    readyLabel: 'Ready to use',
    categoriesLabel: 'Best for',
    useTemplate: 'Use this template',
    previewAlt: 'Preview of the {{name}} CV template',
  },
  notes: {
    title: 'Current flow',
    items: [
      'Builder data stays in place while candidates switch configuration tabs.',
      'Professional has a real renderer and is ready to use now.',
      'New templates should only enable the action after their renderer exists.',
    ],
  },
  upcoming: {
    title: 'In preparation',
    description: 'These layouts are shown as direction only. Their buttons stay disabled until a matching renderer ships.',
    badge: 'Coming soon',
    items: [
      {
        name: 'Minimal ATS',
        description: 'One column, restrained color, tuned for fast screening and ATS-friendly reading.',
        category: 'IT / Operations',
      },
      {
        name: 'Portfolio Focus',
        description: 'For candidates who need projects and outcomes to lead the story.',
        category: 'Marketing / Product',
      },
      {
        name: 'Graduate Start',
        description: 'A lighter structure for education, activities, and first work experience.',
        category: 'Entry level',
      },
    ],
  },
}
