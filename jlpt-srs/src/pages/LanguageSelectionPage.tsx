import React from 'react';
import styled from 'styled-components';

// Placeholder – not routed yet. We'll wire this after localization.
export const LanguageSelectionPage: React.FC = () => {
  return (
    <Wrap>
      <Card>
        <h2>Language</h2>
        <p>This screen will let you pick your language. (Coming soon)</p>
      </Card>
    </Wrap>
  );
};

const Wrap = styled.section` min-height: 100vh; display: grid; place-items: center; padding: 24px; background: ${({ theme }) => theme.colors.bg}; `;
const Card = styled.div` width: min(560px, 94vw); border: 2px solid ${({ theme }) => theme.colors.pixelBorder}; border-radius: 16px; background: ${({ theme }) => theme.colors.panel}; padding: 16px; `;

export default LanguageSelectionPage;

