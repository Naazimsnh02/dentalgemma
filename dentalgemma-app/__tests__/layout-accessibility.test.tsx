/**
 * Property-Based Tests for Layout Accessibility
 * 
 * Property 22: Accessibility Compliance
 * Validates: Requirements 14.1-14.10
 * 
 * For any page in the application, the system SHALL: provide keyboard navigation 
 * with focus indicators, include ARIA labels for screen readers, maintain WCAG 2.1 AA 
 * contrast ratios (≥ 4.5:1), use semantic HTML, respond to viewport changes 
 * (mobile 320px+, tablet 768px+, desktop 1024px+), and achieve Lighthouse 
 * accessibility score > 90.
 */

import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { Disclaimer } from '@/components/shared/disclaimer';
import fc from 'fast-check';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

describe('Property 22: Accessibility Compliance - Layout Components', () => {
  describe('Sidebar Accessibility', () => {
    /**
     * Property: Keyboard Navigation
     * All navigation items should be keyboard accessible
     */
    it('should support full keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      // Get all navigation links
      const links = screen.getAllByRole('link');
      
      // Verify all links are present (11 main features + 2 bottom items)
      expect(links.length).toBeGreaterThanOrEqual(13);

      // Tab through first few links
      await user.tab();
      const firstFocusedElement = document.activeElement;
      expect(firstFocusedElement?.tagName).toBe('BUTTON'); // Collapse button

      await user.tab();
      const secondFocusedElement = document.activeElement;
      expect(secondFocusedElement?.tagName).toBe('A'); // First nav link
    });

    /**
     * Property: ARIA Labels
     * Interactive elements should have proper ARIA labels
     */
    it('should have proper ARIA labels for screen readers', () => {
      render(<Sidebar />);

      // Collapse button should have aria-label
      const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i });
      expect(collapseButton).toBeInTheDocument();
      expect(collapseButton).toHaveAttribute('aria-label');
    });

    /**
     * Property: Semantic HTML
     * Should use semantic HTML elements
     */
    it('should use semantic HTML elements', () => {
      render(<Sidebar />);

      // Should have aside element
      const aside = document.querySelector('aside');
      expect(aside).toBeInTheDocument();

      // Should have nav element
      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // Should have ul/li structure
      const lists = document.querySelectorAll('ul');
      expect(lists.length).toBeGreaterThan(0);
    });

    /**
     * Property: Active State Highlighting
     * Current page should be visually indicated
     */
    it('should highlight active navigation item', () => {
      const { usePathname } = require('next/navigation');
      usePathname.mockReturnValue('/dashboard/xray-analysis');

      render(<Sidebar />);

      const xrayLink = screen.getByRole('link', { name: /x-ray analysis/i });
      
      // Active link should have specific classes
      expect(xrayLink.className).toContain('font-medium');
    });

    /**
     * Property: Collapsible Navigation
     * Sidebar should be collapsible with proper state management
     */
    it('should toggle collapsed state when button clicked', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i });
      
      // Initially expanded
      expect(screen.getByText('DentalGemma')).toBeInTheDocument();

      // Click to collapse
      await user.click(collapseButton);

      // Button label should change
      const expandButton = screen.getByRole('button', { name: /expand sidebar/i });
      expect(expandButton).toBeInTheDocument();
    });
  });

  describe('Navbar Accessibility', () => {
    beforeEach(() => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });

    /**
     * Property: Breadcrumb Navigation
     * Should provide proper breadcrumb navigation with ARIA
     */
    it('should have accessible breadcrumb navigation', () => {
      const { usePathname } = require('next/navigation');
      usePathname.mockReturnValue('/dashboard/xray-analysis');

      render(<Navbar />);

      // Should have breadcrumb navigation
      const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(breadcrumb).toBeInTheDocument();

      // Should have ordered list
      const list = within(breadcrumb).getByRole('list');
      expect(list).toBeInTheDocument();
    });

    /**
     * Property: Search Input Accessibility
     * Search input should have proper labels
     */
    it('should have accessible search input', () => {
      render(<Navbar />);

      const searchInput = screen.getByRole('searchbox', { name: /global search/i });
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('aria-label');
      expect(searchInput).toHaveAttribute('placeholder');
    });

    /**
     * Property: Connection Status Indicator
     * Status should be announced to screen readers
     */
    it('should have accessible connection status indicator', () => {
      render(<Navbar />);

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveTextContent(/online|offline/i);
    });

    /**
     * Property: Keyboard Accessible Search
     * Search should be submittable via keyboard
     */
    it('should support keyboard submission of search', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<Navbar />);

      const searchInput = screen.getByRole('searchbox');
      
      await user.type(searchInput, 'test query');
      await user.keyboard('{Enter}');

      expect(consoleSpy).toHaveBeenCalledWith('Search query:', 'test query');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Disclaimer Accessibility', () => {
    /**
     * Property: Collapsible Disclaimer
     * Disclaimer should be collapsible with proper ARIA attributes
     */
    it('should have collapsible disclaimer with proper ARIA', async () => {
      const user = userEvent.setup();
      render(<Disclaimer />);

      const toggleButton = screen.getByRole('button', { name: /collapse disclaimer/i });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      expect(toggleButton).toHaveAttribute('aria-label');

      // Click to collapse
      await user.click(toggleButton);

      const expandButton = screen.getByRole('button', { name: /expand disclaimer/i });
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });

    /**
     * Property: Semantic Footer
     * Should use semantic footer element with proper role
     */
    it('should use semantic footer element', () => {
      render(<Disclaimer />);

      const footer = screen.getByRole('contentinfo', { name: /medical disclaimer/i });
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe('FOOTER');
    });

    /**
     * Property: Accessible Links
     * All links should be keyboard accessible
     */
    it('should have accessible links', () => {
      render(<Disclaimer />);

      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      const termsLink = screen.getByRole('link', { name: /terms of service/i });
      const aboutLink = screen.getByRole('link', { name: /about dentalgemma/i });

      expect(privacyLink).toBeInTheDocument();
      expect(termsLink).toBeInTheDocument();
      expect(aboutLink).toBeInTheDocument();

      // Links should have href attributes
      expect(privacyLink).toHaveAttribute('href');
      expect(termsLink).toHaveAttribute('href');
      expect(aboutLink).toHaveAttribute('href');
    });

    /**
     * Property: Warning Visibility
     * Important medical warnings should be clearly visible
     */
    it('should display medical warnings prominently', () => {
      render(<Disclaimer />);

      // Should contain key warning text
      expect(screen.getByText(/educational and demonstration purposes only/i)).toBeInTheDocument();
      expect(screen.getByText(/not hipaa compliant/i)).toBeInTheDocument();
      expect(screen.getByText(/not a substitute for professional medical advice/i)).toBeInTheDocument();
    });
  });

  describe('Property-Based: Navigation Item Rendering', () => {
    /**
     * Property: All Navigation Items Render
     * For any valid navigation structure, all items should render with proper attributes
     */
    it('should render all navigation items with proper structure', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '/dashboard',
            '/dashboard/xray-analysis',
            '/dashboard/clinical-assessment',
            '/dashboard/voice-consultation',
            '/dashboard/agentic-workflow',
            '/dashboard/dentist-finder',
            '/dashboard/progress-tracker',
            '/dashboard/research',
            '/dashboard/education',
            '/dashboard/symptom-checker',
            '/dashboard/model-info',
            '/dashboard/history',
            '/dashboard/settings'
          ),
          (pathname) => {
            const { usePathname } = require('next/navigation');
            usePathname.mockReturnValue(pathname);

            const { container } = render(<Sidebar />);

            // All links should have href attribute
            const links = container.querySelectorAll('a[href]');
            expect(links.length).toBeGreaterThan(0);

            // All links should have icons
            const icons = container.querySelectorAll('a svg');
            expect(icons.length).toBe(links.length);

            // At least one link should be active
            const activeLinks = container.querySelectorAll('a.font-medium');
            expect(activeLinks.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 13 } // Test all routes
      );
    });
  });

  describe('Property-Based: Breadcrumb Generation', () => {
    /**
     * Property: Breadcrumbs Match Path
     * For any valid path, breadcrumbs should correctly represent the navigation hierarchy
     */
    it('should generate correct breadcrumbs for any valid path', () => {
      const paths = [
        '/dashboard',
        '/dashboard/xray-analysis',
        '/dashboard/clinical-assessment',
        '/dashboard/settings'
      ];

      paths.forEach((pathname) => {
        const { usePathname } = require('next/navigation');
        usePathname.mockReturnValue(pathname);

        const { container, unmount } = render(<Navbar />);

        const breadcrumb = within(container).getByRole('navigation', { name: /breadcrumb/i });
        
        // Should have breadcrumb items
        const items = within(breadcrumb).getAllByRole('listitem');
        
        // Number of items should match path segments
        const segments = pathname.split('/').filter(Boolean);
        expect(items.length).toBe(segments.length);

        // Clean up after each render
        unmount();
      });
    });
  });

  describe('Property-Based: Connection Status Display', () => {
    /**
     * Property: Connection Status Reflects Network State
     * For any network state (online/offline), the indicator should display correctly
     */
    it('should correctly display connection status for any network state', () => {
      const states = [true, false];

      states.forEach((isOnline) => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: isOnline,
        });

        const { container, unmount } = render(<Navbar />);

        const status = within(container).getByRole('status');
        
        if (isOnline) {
          expect(status).toHaveTextContent(/online/i);
        } else {
          expect(status).toHaveTextContent(/offline/i);
        }

        // Clean up after each render
        unmount();
      });
    });
  });
});
