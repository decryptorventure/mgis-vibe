import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, cn } from '@frontend-team/ui-kit';
import { ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  height?: number;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  children,
  height = 300,
  className,
}) => (
  <Card shadow="none" className={cn('radius_8 border border_primary bg_primary', className)}>
    <CardHeader className="px-4 py-3 border-b border_secondary">
      <CardTitle className="text-sm font-semibold text_primary">{title}</CardTitle>
    </CardHeader>
    <CardContent className="px-4 py-4">
      <div role="img" aria-label={description ?? title}>
        <ResponsiveContainer width="100%" height={height}>
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export default ChartContainer;
