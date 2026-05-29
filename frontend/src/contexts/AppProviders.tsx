import React from 'react';
import { AuthProvider } from './AuthContext';
import { CustomerProvider } from './CustomerContext';
import { ProductProvider } from './ProductContext';
import { BillProvider } from './BillContext';
import { SettingsProvider } from './SettingsContext';
import { PermissionsProvider } from './PermissionsContext';
import { NotificationProvider } from './NotificationContext';

/**
 * AppProviders component composes all domain-specific context providers
 * Follows the Composition pattern and Single Responsibility Principle
 * Each provider manages its own domain without coupling to others
 */
import { VideoTourProvider } from './VideoTourContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <PermissionsProvider>
          <SettingsProvider>
            <CustomerProvider>
              <ProductProvider>
                <BillProvider>
                  {children}
                </BillProvider>
              </ProductProvider>
            </CustomerProvider>
          </SettingsProvider>
        </PermissionsProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

// Re-export all context hooks for convenience
export { useAuth } from './AuthContext';
export { useCustomerContext } from './CustomerContext';
export { useProductContext } from './ProductContext';
export { useBillContext } from './BillContext';
export { useSettingsContext } from './SettingsContext';
export { useNotification } from './NotificationContext';

export default AppProviders;
