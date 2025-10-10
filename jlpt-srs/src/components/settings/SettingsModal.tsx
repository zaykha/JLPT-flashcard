import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/store/auth';
import { upsertProfile, type UserProfile, type JLPTLevelStr } from '@/lib/user-data';
import { usePurchase } from '@/hooks/usePurchase';


type FormState = {
  nickname: string;
  vocabLevel: JLPTLevelStr;
  grammarLevel: JLPTLevelStr;
};

type Props = {
  open?: boolean;
  onClose?: () => void;
  profile: UserProfile | null | undefined;
  variant?: 'modal' | 'inline';
};

const levelOptions: JLPTLevelStr[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const SettingsModal: React.FC<Props> = ({
  open = true,
  onClose,
  profile,
  variant = 'modal',
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const purchase = usePurchase();

  const defaults = useMemo<FormState>(() => ({
    nickname: profile?.nickname ?? '',
    vocabLevel: profile?.vocabLevel ?? 'N5',
    grammarLevel: profile?.grammarLevel ?? (profile?.vocabLevel ?? 'N5'),
  }), [profile]);

  const [form, setForm] = useState<FormState>(defaults);

  useEffect(() => {
    setForm(defaults);
  }, [defaults]);

  const mutation = useMutation({
    mutationFn: async (values: FormState) => {
      if (!user) throw new Error('Not authenticated');
      await upsertProfile(user.uid, {
        nickname: values.nickname,
        vocabLevel: values.vocabLevel,
        grammarLevel: values.grammarLevel,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.uid] });
      onClose?.();
    },
  });

  if (variant === 'modal' && !open) return null;

  const content = (
    <Card as={variant === 'modal' ? 'form' : 'div'} onSubmit={variant === 'modal' ? handleSubmit : undefined}>
      <Header>
        <Title>Study Settings</Title>
        <Subtitle>Update your JLPT level and identity.</Subtitle>
      </Header>

      <Form>
        <Field>
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            value={form.nickname}
            onChange={e => setForm({ ...form, nickname: e.target.value })}
            placeholder="Calligraphy name"
          />
        </Field>

        <Row>
          <Field>
            <Label htmlFor="vocab-level">Vocab level</Label>
            <Select
              id="vocab-level"
              value={form.vocabLevel}
              onChange={e => setForm({ ...form, vocabLevel: e.target.value as JLPTLevelStr })}
            >
              {levelOptions.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label htmlFor="grammar-level">Grammar level</Label>
            <Select
              id="grammar-level"
              value={form.grammarLevel}
              onChange={e => setForm({ ...form, grammarLevel: e.target.value as JLPTLevelStr })}
            >
              {levelOptions.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </Select>
          </Field>
        </Row>

      </Form>

      <Footer>
        {variant === 'modal' && (
          <GhostButton type="button" onClick={onClose}>Cancel</GhostButton>
        )}
        <PrimaryButton
          type={variant === 'modal' ? 'submit' : 'button'}
          onClick={variant === 'modal' ? undefined : () => handleSubmitInline()}
          disabled={mutation.isPending || !user}
        >
          {mutation.isPending ? 'Saving…' : 'Save settings'}
        </PrimaryButton>
      </Footer>
    </Card>
  );

  if (variant === 'modal') {
    return (
      <Backdrop onMouseDown={handleBackdrop}>
        {content}
      </Backdrop>
    );
  }

  return content;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    triggerSave();
  }

  function handleSubmitInline() {
    triggerSave();
  }

  function triggerSave() {
    if (!user || mutation.isPending) return;
    const levelChanged = form.vocabLevel !== profile?.vocabLevel;

    const proceed = async () => {
      try {
        if (levelChanged) {
          const change: Record<string, string> = {
            field: 'jlptBand',
            to: form.vocabLevel,
          };
          if (profile?.vocabLevel) change.from = profile.vocabLevel;

          await purchase('change_settings', {
            jlptBand: form.vocabLevel,
            changes: [change],
          });
        }
        mutation.mutate(form);
      } catch (error) {
        console.warn('[settings] change_settings purchase failed', error);
      }
    };

    void proceed();
  }

  function handleBackdrop(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose?.();
  }
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: grid;
  place-items: center;
  padding: 24px;
  z-index: 80;
`;

const Card = styled.form`
  width: min(420px, 92vw);
  border-radius: 18px;
  border: 2px solid #000;
  background: ${({ theme }) => theme.colors.sheetBg};
  box-shadow: 0 18px 32px rgba(0,0,0,0.45);
  padding: 20px 20px 16px;
  display: grid;
  gap: 16px;
`;

const Header = styled.div`
  display: grid;
  gap: 6px;
`;

const Title = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: .08em;
  text-transform: uppercase;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Form = styled.div`
  display: grid;
  gap: 14px;
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  font-size: 0.8rem;
`;

const Label = styled.span`
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Input = styled.input`
  border-radius: 12px;
  border: 2px solid #000;
  padding: 10px 12px;
  font-size: 0.95rem;
  font-family: ${({ theme }) => theme.fonts.body};
`;

const Select = styled.select`
  border-radius: 12px;
  border: 2px solid #000;
  padding: 10px 12px;
  font-size: 0.95rem;
  font-family: ${({ theme }) => theme.fonts.body};
`;

const Row = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const PrimaryButton = styled.button`
  padding: 12px 18px;
  border-radius: 12px;
  border: 2px solid #000;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-family: ${({ theme }) => theme.fonts.heading};
  text-transform: uppercase;
  letter-spacing: .06em;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const GhostButton = styled(PrimaryButton)`
  background: #1f2937;
`;
