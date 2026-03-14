import prisma from '../lib/prisma';
import { format } from 'date-fns';

export const exportUserData = async (userId: string, formatType: 'json' | 'csv') => {
  const entries = await prisma.learningEntry.findMany({
    where: { userId },
    orderBy: { completionDate: 'desc' }
  });

  if (formatType === 'json') {
    return {
      contentType: 'application/json',
      filename: `learntrace-export-${format(new Date(), 'yyyy-MM-dd')}.json`,
      content: JSON.stringify(entries, null, 2)
    };
  } else {
    const headers = ['Title', 'Platform', 'Domain', 'Sub-domain', 'Start Date', 'Completion Date', 'Skills', 'Description', 'Reflection'];
    const csvRows = [
      headers.join(','),
      ...entries.map((entry) => {
        return [
          `"${entry.title.replace(/"/g, '""')}"`,
          `"${entry.platform.replace(/"/g, '""')}"`,
          `"${entry.domain.replace(/"/g, '""')}"`,
          `"${(entry.subDomain || '').replace(/"/g, '""')}"`,
          format(new Date(entry.startDate), 'yyyy-MM-dd'),
          format(new Date(entry.completionDate), 'yyyy-MM-dd'),
          `"${entry.skills.join('; ').replace(/"/g, '""')}"`,
          `"${(entry.description || '').replace(/"/g, '""')}"`,
          `"${(entry.reflection || '').replace(/"/g, '""')}"`,
        ].join(',');
      }),
    ];

    return {
      contentType: 'text/csv',
      filename: `learntrace-export-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      content: csvRows.join('\n')
    };
  }
};
