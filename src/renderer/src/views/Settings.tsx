import { useEffect, useState } from 'react';
import { useLibrary } from '../store/library';
import { api } from '../lib/sonara-api';
import type { UpdaterStatus } from '@shared/types';
import { CheckIcon, DownloadIcon } from '../components/Icon';

export function SettingsView() {
  const { settings, updateSettings } = useLibrary((s) => ({
    settings: s.settings,
    updateSettings: s.updateSettings
  }));

  return (
    <div className="px-8 pb-12 pt-4">
      <h1 className="text-h1 gradient-text mb-2">Настройки</h1>
      <p className="mb-10 text-sm text-fg-muted">Внешний вид, подключения и обновления.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Внешний вид">
          <Row
            label="Акцентный цвет"
            description="Брать ли цвет из обложки текущего трека"
          >
            <div className="inline-flex rounded-full border border-line bg-bg-surface p-0.5">
              <Toggle
                active={settings.accentMode === 'cover'}
                onClick={() => updateSettings({ accentMode: 'cover' })}
                label="По обложке"
              />
              <Toggle
                active={settings.accentMode === 'fixed'}
                onClick={() => updateSettings({ accentMode: 'fixed' })}
                label="Фирменный"
              />
            </div>
          </Row>
          <Row
            label="Плотность интерфейса"
            description="Размер списков и отступов"
          >
            <div className="inline-flex rounded-full border border-line bg-bg-surface p-0.5">
              <Toggle
                active={settings.density === 'comfortable'}
                onClick={() => updateSettings({ density: 'comfortable' })}
                label="Просторно"
              />
              <Toggle
                active={settings.density === 'compact'}
                onClick={() => updateSettings({ density: 'compact' })}
                label="Компактно"
              />
            </div>
          </Row>
        </Card>

        <Card title="Подключения">
          <Row
            label="Spotify"
            description="OAuth (PKCE) подключение появится в ближайшем апдейте."
          >
            <span className="rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-wider text-fg-subtle">
              скоро
            </span>
          </Row>
          <Row
            label="SoundCloud"
            description="Работает без подключения через публичный API + embed."
          >
            <span className="inline-flex items-center gap-1 rounded-full border border-soundcloud/40 bg-soundcloud/10 px-3 py-1 text-[11px] uppercase tracking-wider text-soundcloud">
              <CheckIcon size={12} /> готово
            </span>
          </Row>
        </Card>

        <Card title="Обновления" className="md:col-span-2">
          <UpdaterPanel />
        </Card>

        <Card title="О Sonara" className="md:col-span-2">
          <p className="text-sm text-fg-muted">
            Sonara — гибридный музыкальный плеер для Spotify и SoundCloud в едином тёмном интерфейсе.
            Создан вручную на Electron, React и TypeScript. Версия {APP_VERSION}.
          </p>
        </Card>
      </div>
    </div>
  );
}

const APP_VERSION = '2.0.0';

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-bg-surface/40 p-6 ${className}`}>
      <h3 className="text-h3 mb-4 text-fg">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/60 pb-4 last:border-b-0 last:pb-0">
      <div>
        <div className="text-sm font-medium text-fg">{label}</div>
        {description && <div className="text-xs text-fg-muted">{description}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs transition-colors ${
        active ? 'bg-fg text-bg-deep' : 'text-fg-muted hover:text-fg'
      }`}
    >
      {label}
    </button>
  );
}

function UpdaterPanel() {
  const [status, setStatus] = useState<UpdaterStatus>({ state: 'idle' });

  useEffect(() => {
    api.updater.status().then(setStatus);
    const off = api.updater.onEvent(setStatus);
    return off;
  }, []);

  const isDev = status.state === 'dev';

  return (
    <div>
      <Row label="Текущая версия" description={`Sonara ${APP_VERSION}`}>
        <button
          type="button"
          className="btn-pill"
          disabled={isDev}
          onClick={async () => setStatus(await api.updater.check())}
        >
          {isDev ? 'Авто-обновления (только в установленной версии)' : 'Проверить сейчас'}
        </button>
      </Row>
      {!isDev && (
        <Row label="Статус" description={describeStatus(status)}>
          {status.state === 'available' && (
            <button
              type="button"
              className="btn-accent"
              onClick={async () => setStatus(await api.updater.download())}
            >
              <DownloadIcon size={14} /> Скачать {status.info?.version}
            </button>
          )}
          {status.state === 'downloaded' && (
            <button type="button" className="btn-accent" onClick={() => api.updater.install()}>
              Перезапустить и установить
            </button>
          )}
          {status.state === 'downloading' && (
            <span className="text-xs text-fg-muted">
              {Math.round(status.progress?.percent ?? 0)}%
            </span>
          )}
        </Row>
      )}
    </div>
  );
}

function describeStatus(s: UpdaterStatus): string {
  switch (s.state) {
    case 'idle':
      return 'Актуальная версия';
    case 'checking':
      return 'Проверяем…';
    case 'available':
      return `Доступна версия ${s.info?.version ?? ''}`;
    case 'downloading':
      return 'Скачивается обновление';
    case 'downloaded':
      return 'Готово к установке';
    case 'error':
      return s.error ?? 'Ошибка';
    case 'dev':
      return 'В режиме разработки авто-обновления отключены';
  }
}
