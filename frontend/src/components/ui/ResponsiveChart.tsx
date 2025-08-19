import React, { useEffect, useRef, useState } from 'react';
import { useResponsive } from '../../contexts/ResponsiveContext';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ResponsiveChartProps {
  data: ChartDataPoint[];
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title?: string;
  className?: string;
  height?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  showLegend?: boolean;
  showValues?: boolean;
  colors?: string[];
  emptyMessage?: string;
}

export const ResponsiveChart: React.FC<ResponsiveChartProps> = ({
  data,
  type,
  title,
  className = '',
  height = { mobile: 200, tablet: 300, desktop: 400 },
  showLegend = true,
  showValues = true,
  colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
  ],
  emptyMessage = 'Žádná data k zobrazení',
}) => {
  const { state } = useResponsive();
  const { isMobile, isTablet } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });

  // Get responsive height
  const currentHeight = isMobile ? height.mobile : isTablet ? height.tablet : height.desktop;

  // Update canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          const width = container.clientWidth;
          setChartDimensions({ width, height: currentHeight });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [currentHeight]);

  // Simple chart rendering function
  const renderChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = chartDimensions.width;
    canvas.height = chartDimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart area calculations
    const padding = isMobile ? 20 : 40;
    const legendHeight = showLegend ? (isMobile ? 60 : 80) : 0;
    const titleHeight = title ? (isMobile ? 30 : 40) : 0;
    
    const chartArea = {
      x: padding,
      y: padding + titleHeight,
      width: canvas.width - (padding * 2),
      height: canvas.height - (padding * 2) - legendHeight - titleHeight,
    };

    // Draw title
    if (title) {
      ctx.fillStyle = '#374151';
      ctx.font = `${isMobile ? '14' : '16'}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(title, canvas.width / 2, padding + (titleHeight / 2));
    }

    // Prepare data with colors
    const chartData = data.map((item, index) => ({
      ...item,
      color: item.color || colors[index % colors.length],
    }));

    // Render based on chart type
    switch (type) {
      case 'bar':
        renderBarChart(ctx, chartData, chartArea);
        break;
      case 'line':
        renderLineChart(ctx, chartData, chartArea);
        break;
      case 'pie':
      case 'doughnut':
        renderPieChart(ctx, chartData, chartArea, type === 'doughnut');
        break;
    }

    // Draw legend
    if (showLegend) {
      renderLegend(ctx, chartData, {
        x: padding,
        y: canvas.height - legendHeight,
        width: canvas.width - (padding * 2),
        height: legendHeight,
      });
    }
  };

  const renderBarChart = (ctx: CanvasRenderingContext2D, chartData: any[], area: any) => {
    const maxValue = Math.max(...chartData.map(d => d.value));
    const barWidth = area.width / chartData.length * 0.8;
    const barSpacing = area.width / chartData.length * 0.2;

    chartData.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * area.height * 0.8;
      const x = area.x + (index * (barWidth + barSpacing)) + (barSpacing / 2);
      const y = area.y + area.height - barHeight;

      // Draw bar
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value label
      if (showValues) {
        ctx.fillStyle = '#374151';
        ctx.font = `${isMobile ? '10' : '12'}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);
      }

      // Draw label
      ctx.fillStyle = '#6B7280';
      ctx.font = `${isMobile ? '10' : '12'}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      const labelY = area.y + area.height + 15;
      ctx.fillText(item.label, x + barWidth / 2, labelY);
    });
  };

  const renderLineChart = (ctx: CanvasRenderingContext2D, chartData: any[], area: any) => {
    const maxValue = Math.max(...chartData.map(d => d.value));
    const pointSpacing = area.width / (chartData.length - 1);

    // Draw line
    ctx.strokeStyle = chartData[0]?.color || colors[0];
    ctx.lineWidth = 2;
    ctx.beginPath();

    chartData.forEach((item, index) => {
      const x = area.x + (index * pointSpacing);
      const y = area.y + area.height - ((item.value / maxValue) * area.height * 0.8);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw point
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw value label
      if (showValues) {
        ctx.fillStyle = '#374151';
        ctx.font = `${isMobile ? '10' : '12'}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(item.value.toString(), x, y - 10);
      }

      // Draw label
      ctx.fillStyle = '#6B7280';
      ctx.font = `${isMobile ? '10' : '12'}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x, area.y + area.height + 15);
    });

    ctx.stroke();
  };

  const renderPieChart = (ctx: CanvasRenderingContext2D, chartData: any[], area: any, isDoughnut: boolean) => {
    const centerX = area.x + area.width / 2;
    const centerY = area.y + area.height / 2;
    const radius = Math.min(area.width, area.height) / 2 * 0.8;
    const innerRadius = isDoughnut ? radius * 0.5 : 0;

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2; // Start at top

    chartData.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      // Draw slice
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      if (isDoughnut) {
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      } else {
        ctx.lineTo(centerX, centerY);
      }
      ctx.closePath();
      ctx.fill();

      // Draw value label
      if (showValues) {
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelRadius = (radius + innerRadius) / 2;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${isMobile ? '10' : '12'}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(item.value.toString(), labelX, labelY);
      }

      currentAngle += sliceAngle;
    });
  };

  const renderLegend = (ctx: CanvasRenderingContext2D, chartData: any[], area: any) => {
    const itemsPerRow = isMobile ? 2 : 4;
    const itemWidth = area.width / itemsPerRow;
    const itemHeight = area.height / Math.ceil(chartData.length / itemsPerRow);

    chartData.forEach((item, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      const x = area.x + (col * itemWidth);
      const y = area.y + (row * itemHeight);

      // Draw color box
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y + itemHeight / 2 - 6, 12, 12);

      // Draw label
      ctx.fillStyle = '#374151';
      ctx.font = `${isMobile ? '10' : '12'}px Inter, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(item.label, x + 18, y + itemHeight / 2 + 4);
    });
  };

  // Render chart when data or dimensions change
  useEffect(() => {
    if (chartDimensions.width > 0) {
      renderChart();
    }
  }, [data, chartDimensions, type, showLegend, showValues, isMobile, isTablet]);

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: currentHeight }}>
        <div className="text-center text-gray-500 dark:text-neutral-400">
          <div className="text-4xl mb-2">📊</div>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: currentHeight }}
      />
    </div>
  );
};