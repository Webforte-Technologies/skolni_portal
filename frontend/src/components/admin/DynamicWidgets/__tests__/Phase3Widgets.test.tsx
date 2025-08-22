import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TrendAnalysisWidget from '../TrendAnalysisWidget';
import PredictiveInsightsWidget from '../PredictiveInsightsWidget';
import AnomalyDetectionWidget from '../AnomalyDetectionWidget';
import DashboardLayoutManager from '../DashboardLayoutManager';

// Mock the useRealTimeData hook
jest.mock('../../../hooks/useRealTimeData', () => ({
  useRealTimeData: jest.fn()
}));

// Mock the useToast context
jest.mock('../../../contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn()
  })
}));

// Mock the api client
jest.mock('../../../services/apiClient', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

const mockUseRealTimeData = jest.requireMock('../../../hooks/useRealTimeData').useRealTimeData;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Phase 3 Widgets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TrendAnalysisWidget', () => {
    it('renders correctly with loading state', () => {
      mockUseRealTimeData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refresh: jest.fn(),
        isAutoRefreshing: false,
        lastUpdated: null
      });

      renderWithRouter(
        <TrendAnalysisWidget
          title="Test Trends"
          endpoint="/test/trends"
        />
      );

      expect(screen.getByText('Test Trends')).toBeInTheDocument();
      expect(screen.getByText('Analýza trendů')).toBeInTheDocument();
    });

    it('renders correctly with data', () => {
      const mockData = {
        trends: {
          users: {
            total_growth: 150,
            average_daily: 5,
            daily_growth: []
          },
          credits: {
            total_purchased: 1000,
            total_used: 500,
            daily_transactions: []
          }
        }
      };

      mockUseRealTimeData.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refresh: jest.fn(),
        isAutoRefreshing: true,
        lastUpdated: new Date().toISOString()
      });

      renderWithRouter(
        <TrendAnalysisWidget
          title="Test Trends"
          endpoint="/test/trends"
        />
      );

      expect(screen.getByText('Uživatelé')).toBeInTheDocument();
      expect(screen.getByText('Kredity')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('1000 kreditů')).toBeInTheDocument();
    });
  });

  describe('PredictiveInsightsWidget', () => {
    it('renders correctly with loading state', () => {
      mockUseRealTimeData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refresh: jest.fn(),
        isAutoRefreshing: false,
        lastUpdated: null
      });

      renderWithRouter(
        <PredictiveInsightsWidget
          title="Test Predictions"
          endpoint="/test/predictions"
        />
      );

      expect(screen.getByText('Test Predictions')).toBeInTheDocument();
      expect(screen.getByText('Prediktivní analýza')).toBeInTheDocument();
    });

    it('renders correctly with data', () => {
      const mockData = {
        predictions: {
          user_growth: {
            current_daily_average: 5,
            projected_total: 450,
            confidence: 0.85,
            factors: ['current_growth_rate', 'seasonal_patterns']
          },
          revenue: {
            current_daily_average: 100,
            projected_total: 9000,
            confidence: 0.78,
            factors: ['current_revenue_trend', 'user_growth']
          }
        },
        confidence_levels: {
          user_growth: 0.85,
          revenue: 0.78,
          credit_usage: 0.92
        }
      };

      mockUseRealTimeData.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refresh: jest.fn(),
        isAutoRefreshing: true,
        lastUpdated: new Date().toISOString()
      });

      renderWithRouter(
        <PredictiveInsightsWidget
          title="Test Predictions"
          endpoint="/test/predictions"
        />
      );

      expect(screen.getByText('Růst uživatelů')).toBeInTheDocument();
      expect(screen.getByText('Příjmy')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('78%')).toBeInTheDocument();
    });
  });

  describe('AnomalyDetectionWidget', () => {
    it('renders correctly with loading state', () => {
      mockUseRealTimeData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refresh: jest.fn(),
        isAutoRefreshing: false,
        lastUpdated: null
      });

      renderWithRouter(
        <AnomalyDetectionWidget
          title="Test Anomalies"
          endpoint="/test/anomalies"
        />
      );

      expect(screen.getByText('Test Anomalies')).toBeInTheDocument();
      expect(screen.getByText('Detekce anomálií')).toBeInTheDocument();
    });

    it('renders correctly with data', () => {
      const mockData = {
        anomalies: [
          {
            type: 'user_registration_spike',
            severity: 'medium',
            message: 'Unusual spike in user registrations: 25 on 2024-01-15',
            metric_value: 25,
            threshold_value: 8,
            detected_at: '2024-01-15T10:00:00Z'
          }
        ],
        total_detected: 1,
        severity_distribution: {
          medium: 1
        }
      };

      mockUseRealTimeData.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refresh: jest.fn(),
        isAutoRefreshing: true,
        lastUpdated: new Date().toISOString()
      });

      renderWithRouter(
        <AnomalyDetectionWidget
          title="Test Anomalies"
          endpoint="/test/anomalies"
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Celkem detekováno')).toBeInTheDocument();
      expect(screen.getByText('Náhlý nárůst registrací')).toBeInTheDocument();
      expect(screen.getByText('Střední')).toBeInTheDocument();
    });
  });

  describe('DashboardLayoutManager', () => {
    it('renders correctly', () => {
      renderWithRouter(
        <DashboardLayoutManager
          title="Test Layouts"
        />
      );

      expect(screen.getByText('Test Layouts')).toBeInTheDocument();
      expect(screen.getByText('Vytvořit nové rozložení')).toBeInTheDocument();
    });

    it('shows create form when button is clicked', () => {
      renderWithRouter(
        <DashboardLayoutManager
          title="Test Layouts"
        />
      );

      const createButton = screen.getByText('Nové rozložení');
      fireEvent.click(createButton);

      expect(screen.getByText('Název rozložení *')).toBeInTheDocument();
      expect(screen.getByText('Typ rozložení')).toBeInTheDocument();
      expect(screen.getByText('Vyberte widgety *')).toBeInTheDocument();
    });
  });
});
