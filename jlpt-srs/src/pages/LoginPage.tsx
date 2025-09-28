import React from 'react';
import { useAuth } from '@/store/auth';
import { Navigate } from 'react-router-dom';
import styled from "styled-components";
// import kozalogin from "@/assets/Loginpage/kozalogin.png";
// import kozalogin1 from "@/assets/Loginpage/kozalogin1.png";
// import logincardbg from "@/assets/Loginpage/logincardbg.png";
// import logo from "@/assets/Logos/kozaLogo1.png";

/** ======= Layout ======= */
const Screen = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: url(/kozalogin.png) center/cover no-repeat fixed;
  position: relative;
  padding: 24px 12px; /* breathing room on small screens */

  @media (max-width: 520px) {
  min-height: 100%;
    padding: 10px 10px;
    background: url(/kozalogin1.png) center/cover no-repeat fixed;

`;

const Backdrop = styled.div`
  position: absolute; inset: 0;
  background: linear-gradient(to right, rgba(0,0,0,.35), rgba(0,0,0,.35));
  
`;

const Sheet = styled.div`
  position: relative;
  z-index: 1;
  width: min(420px, 92vw);
  color: #fff;
  padding: 22px;
  background: transparent;

  &::before {
    content: "";
    position: absolute;
    inset: -160px;
    background: url(/logincardbg.png) center/cover no-repeat;
    z-index: -1;
    pointer-events: none;
    border-radius: 4px;
    filter: saturate(.95);
  }

  @media (max-width: 520px) {
    width: 100%;
    padding: 16px 14px;
    background: transparent;   /* no background color */

    &::before {
      content: none;           /* completely remove pseudo-element */
      display: none;
      background: none;
    }
  }
`;


/** ======= Header ======= */
const Brand = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
`;

const Logo = styled.img`
  width: clamp(96px, 28vw, 180px);
  height: clamp(96px, 28vw, 180px);
  object-fit: contain;
  margin-top: clamp(10px, 4vw, 40px);
  @media (max-width: 520px) {
    width: clamp(56px, 28vw, 180px);
    height: clamp(56px, 28vw, 180px);
    margin-top: 0;
  }
  `;

  const Title = styled.h1`
  /* Font Styling for Retro Game Look */
  // font-family: 'Monospace', sans-serif; /* Use a pixel/retro font if available, or monospace as a fallback */
  font-size: clamp(20px, 6vw, 35px); /* Slightly larger for impact */
  line-height: 1.2;
  margin: 0 0 8px; /* Increased margin for better separation */
  font-weight: 700;
  
  /* Base Color - Brighter/More 'Gamey' */
  color: #FFC300; /* Bright yellow/gold for a coin/title screen effect */
  text-align: center;
  
  /* 3D Depth and Drop Shadow using multiple text-shadow layers */
  text-shadow: 
    /* 3D Depth layers (to the right and down) */
    1px 1px 0 #A80000, /* Darker Red layer 1 */
    2px 2px 0 #A80000, /* Darker Red layer 2 */
    3px 3px 0 #A80000, /* Darker Red layer 3 */
    
    /* Strong Drop Shadow (further out, darker, with slight blur for better effect) */
    4px 4px 0 #4B0000, /* Deep red/brown for sprite base shadow */
    5px 5px 4px #000000; /* Classic dark drop shadow, slight blur */
`;

const Subtitle = styled.p`
  /* Font Styling for Retro Game Look */
  // font-family: 'Monospace', sans-serif; /* Use a pixel/retro font if available, or monospace as a fallback */
  margin: 0 0 16px;
  
  /* Base Color */
  color: #FFFFFF; /* White/bright for contrast */
  font-size: clamp(14px, 4.4vw, 18px);
  text-align: center;

  /* 3D Depth and Drop Shadow - Subtler than the Title */
  text-shadow: 
    /* 3D Depth layers (to the right and down) */
    1px 1px 0 #006400, /* Dark Green layer 1 */
    2px 2px 0 #006400, /* Dark Green layer 2 */

    /* Strong Drop Shadow */
    3px 3px 2px #000000; /* Dark shadow, slight blur */
`;


/** ======= Buttons ======= */
const Primary = styled.button`
  width: 100%;
  padding: clamp(12px, 3.6vw, 16px) clamp(14px, 4.5vw, 20px);
  margin-top: 8px;
  font-family: ${(p) => p.theme.fonts.body};
  font-size: clamp(12px, 3.6vw, 14px);
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: .06em;
  cursor: pointer;

  background: #8B6B3F;
  border: 4px solid #4a351f;
  border-radius: 12px;
  box-shadow: 4px 4px 0 #4a351f;
  transition: transform .1s ease, box-shadow .1s ease, background .15s ease;

  &:hover { background: #a37e4b; }
  &:active { transform: translate(4px, 4px); box-shadow: 0 0 0 #4a351f; }
`;

const DividerRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  margin: 16px 0;

  color: #fff;
  font-weight: 700;
  font-size: clamp(11px, 3.2vw, 13px);
  text-transform: uppercase;

  &::before,
  &::after {
    content: "";
    height: 3px;
    background: #333;
    display: block;
    box-shadow: 2px 2px 0 #999;
  }

  @media (max-width: 520px) {
    gap: 8px;
    &::before, &::after { height: 2px; box-shadow: 1px 1px 0 #999; }
  }
`;

const SocialBtn = styled.button<{dimmed?: boolean}>`
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  font-family: ${(p) => p.theme.fonts.body};

  padding: clamp(10px, 3.6vw, 14px) clamp(12px, 4.4vw, 18px);
  font-weight: 300;
  font-size: clamp(12px, 3.4vw, 13px);
  text-transform: uppercase;
  cursor: pointer;

  background: #f7f7f7;
  color: #111;
  border: 3px solid #333;
  border-radius: 12px;
  box-shadow: 4px 4px 0 #333;
  transition: transform .1s ease, box-shadow .1s ease, background .15s ease;

  &:hover { background: #eaeaea; }
  &:active { transform: translate(4px, 4px); box-shadow: 0 0 0 #333; }

  ${(p) => p.dimmed && `
    opacity: .6; cursor: not-allowed; box-shadow: none;
  `}

  @media (max-width: 520px) {
    gap: 8px;
    font-size: 10px;
`;

const ButtonsCol = styled.div`
  display: grid; gap: 12px;
  margin-bottom: clamp(30px, 10vw, 70px);
`;


/** ======= Footer ======= */
const Legal = styled.p`
  position: absolute;
  left: 0; right: 0;
  bottom: max(8px, env(safe-area-inset-bottom));
  margin: 0;
  text-align: center;
  color: #e3e3e3;
  font-size: clamp(10px, 2.8vw, 12px);
  line-height: 1.3;

  a { color: #8B6B3F; text-decoration: none; }
`;


/** ======= Inline Icons (you can swap to files later) ======= */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path fill="#EA4335" d="M12 10.2v3.9h6.5c-.3 2-2.2 5.9-6.5 5.9-3.9 0-7.1-3.2-7.1-7.1S8.1 5.8 12 5.8c2.2 0 3.6.9 4.4 1.7l3-3C17.8 3 15.2 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.9 0-.7-.1-1.1-.1-1.6H12Z"/>
  </svg>
);
const FbIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path fill="#1877F2" d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 5.01 3.66 9.17 8.44 9.96v-7.05H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.25 0-1.64.78-1.64 1.58v1.9h2.79l-.45 2.9h-2.34v7.05c4.78-.79 8.44-4.95 8.44-9.96Z"/>
  </svg>
);
const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path fill="#111" d="M16.365 13.314c.03 3.273 2.87 4.364 2.902 4.379-.023.074-.45 1.548-1.484 3.064-.894 1.316-1.822 2.63-3.285 2.657-1.44.027-1.906-.86-3.555-.86-1.648 0-2.16.832-3.52.886-1.418.055-2.498-1.422-3.4-2.735-1.853-2.673-3.266-7.552-1.366-10.857.94-1.622 2.622-2.648 4.457-2.676 1.388-.027 2.696.938 3.555.938.86 0 2.45-1.157 4.137-.986.705.03 2.686.283 3.957 2.139-.103.064-2.36 1.378-2.3 3.391ZM13.35 3.883c.736-.887 1.232-2.123 1.095-3.359-1.06.043-2.34.706-3.1 1.592-.68.747-1.27 2.033-1.113 3.233 1.18.09 2.383-.58 3.118-1.466Z"/>
  </svg>
);


export const LoginPage: React.FC = () => {
  const { user, signInGoogle } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return (
    <Screen>
      <Backdrop />
      <Sheet>
        <Brand>
          <Logo src={'/kozaLogo1.png'} alt="Koza World" />
          <Title>KOZA World</Title>
          <Subtitle>Take your Japanese to the next level.</Subtitle>
        </Brand>

        <ButtonsCol>
          <Primary onClick={() => null /* TODO: Facebook */}>Continue with email</Primary>

          <DividerRow>OR</DividerRow>

          <SocialBtn onClick={signInGoogle}>
            <GoogleIcon /> Continue with Google
          </SocialBtn>

          <SocialBtn dimmed onClick={() => null /* TODO: Facebook */}>
            <FbIcon /> Continue with Facebook
          </SocialBtn>

          <SocialBtn dimmed onClick={() => null /* TODO: Apple */}>
            <AppleIcon /> Continue with Apple
          </SocialBtn>
        </ButtonsCol>

        <Legal>
          By continuing, you agree to our <a href="/terms">Terms of Use</a> and{" "}
          <a href="/privacy">Privacy Policy</a>.
        </Legal>
      </Sheet>
      
    </Screen>
  );
};
