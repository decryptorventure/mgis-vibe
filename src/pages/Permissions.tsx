import React, { useState, useEffect, useMemo } from 'react';
import { Input, Button, Checkbox, Tag, Skeleton, Card } from 'antd';
import { Search, Plus, Trash2, Smartphone, Apple, Hexagon, Shield } from 'lucide-react';
import { PageHeader, EmptyState } from '../components/ui';

// Phase 7: Move static mock data to module scope
const users = [
  { id: '1', name: 'Trần Đức Trọng', email: 'trongtd@ikameglobal.com', avatar: 'T', color: 'var(--chart-5)' },
  { id: '2', name: 'Tô Đình Tùng', email: 'tungtd@ikameglobal.com', avatar: 'T', color: 'var(--chart-1)', isImage: true },
  { id: '3', name: 'Phạm Khánh Toàn', email: 'toanpk@ikameglobal.com', avatar: 'P', color: 'var(--chart-4)', isImage: true },
  { id: '4', name: 'Đặng Thị Bắc', email: 'bacdt@ikameglobal.com', avatar: 'Đ', color: 'var(--chart-6)', isImage: true },
  { id: '5', name: 'Mạc Văn Hiệp', email: 'hiepmv@ikameglobal.com', avatar: 'M', color: 'var(--chart-2)', isImage: true },
];

const apps = [
  { id: 'app1', name: 'iG_Hot_Pot_IOS', package: '6754552669', icon: 'I', os: 'ios', permissions: { google: 'NONE', meta: 'NONE', apple: 'NONE' } },
  { id: 'app2', name: 'iG_Hot_Pot', package: 'com.ig.hot.pot', icon: 'I', os: 'android', permissions: { google: 'NONE', meta: 'NONE', apple: 'NONE' } },
  { id: 'app3', name: 'Clean_Android', package: 'com.aicleaner.cleanstorage.ai', icon: 'C', os: 'android', permissions: { google: 'NONE', meta: 'NONE', apple: 'NONE' } },
  { id: 'app4', name: 'AI_Home_ios', package: '6754923194', icon: 'A', os: 'ios', permissions: { google: 'NONE', meta: 'NONE', apple: 'NONE' } },
  { id: 'app5', name: 'AI_Home', package: 'com.ai.home.decor.aihomedesign', icon: 'A', os: 'android', permissions: { google: 'NONE', meta: 'NONE', apple: 'NONE' } },
  { id: 'app6', name: 'DramaOn', package: 'com.begamob.drama', icon: 'D', os: 'android', permissions: { google: 'NONE', meta: 'NONE', apple: 'NONE' } },
];

const PermissionBadge = ({ network, level }: { network: string, level: string }) => {
  const isNone = level === 'NONE';
  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-lg border ${isNone ? 'border-[var(--border-subtle)] bg-[var(--surface-subtle)]' : 'border-[var(--status-info-border)] bg-[var(--status-info-bg)]'}`}>
      <div className={`mb-1 ${isNone ? 'text-[var(--text-disabled)]' : 'text-[var(--status-info)]'}`}>
        {network === 'google' && <Hexagon size={18} />}
        {network === 'meta' && <Hexagon size={18} />}
        {network === 'apple' && <Apple size={18} />}
      </div>
      <span className={`text-[10px] font-semibold ${isNone ? 'text-[var(--text-tertiary)]' : 'text-[var(--status-info)]'}`}>
        {level}
      </span>
    </div>
  );
};

export const Permissions: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState(users[0].id);
  const [search, setSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Phase 4: Loading state with cleanup
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Phase 4: Filter users by search
  const filteredUsers = useMemo(() =>
    users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  // Phase 4: Filter apps by app search
  const filteredApps = useMemo(() =>
    apps.filter(a =>
      a.name.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.package.toLowerCase().includes(appSearch.toLowerCase())
    ),
    [appSearch]
  );

  // Phase 4: Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <div className="flex h-[calc(100vh-120px)] -m-6">
          <div className="w-[320px] border-r border-[var(--border-default)] bg-[var(--surface-base)] p-4">
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
          <div className="flex-1 p-6">
            <Skeleton active paragraph={{ rows: 10 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Phase 8: Use PageHeader */}
      <div className="mb-4">
        <PageHeader
          icon={<Shield size={20} />}
          iconBg="var(--chart-4)"
          title="Permissions"
          subtitle="Quản lý quyền truy cập ứng dụng cho nhân viên"
        />
      </div>

      <div className="flex h-[calc(100vh-180px)] -mx-6">
        {/* Left Sidebar - Users List */}
        <div className="w-[320px] border-r border-[var(--border-default)] bg-[var(--surface-base)] flex flex-col">
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-[var(--text-secondary)] text-sm uppercase">STAFF ({filteredUsers.length})</span>
            </div>
            <Input
              prefix={<Search size={16} className="text-[var(--text-tertiary)]" />}
              placeholder="Search staff..."
              className="rounded-lg bg-[var(--surface-subtle)] border-[var(--border-default)] hover:border-[var(--border-strong)] focus:border-primary-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedUser === user.id ? 'bg-[var(--surface-subtle)] border border-[var(--border-default)]' : 'hover:bg-[var(--surface-subtle)] border border-transparent'}`}
                >
                  {user.isImage ? (
                    <div className="w-10 h-10 rounded-full bg-[var(--surface-muted)] overflow-hidden flex-shrink-0">
                      <img src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                    </div>
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full text-[var(--text-inverse)] flex items-center justify-center font-bold flex-shrink-0"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.avatar}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <div className={`font-semibold truncate ${selectedUser === user.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {user.name}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">{user.email}</div>
                  </div>
                </div>
              ))
            ) : (
              /* Phase 4: Empty state for user search */
              <div className="text-center py-8 text-[var(--text-tertiary)] text-xs font-semibold">
                Không tìm thấy nhân viên nào khớp "{search}"
              </div>
            )}
          </div>
        </div>

        {/* Right Content - App Permissions */}
        <div className="flex-1 flex flex-col bg-[var(--surface-subtle)]">
          <div className="p-4 border-b border-[var(--border-default)] bg-[var(--surface-base)] sticky top-0 z-10 flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">{users.find(u => u.id === selectedUser)?.name}</h2>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Checkbox>Select All</Checkbox>
                <Tag className="rounded-full bg-[var(--surface-muted)] border-0 text-[var(--text-secondary)] font-medium px-3 py-1">All Apps (Access: 0)</Tag>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 mr-4 text-xs font-medium">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--border-strong)]"></span> None</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--status-info)]"></span> Viewer</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--status-success)]"></span> Editor (Admin)</div>
              </div>
              <Button icon={<Plus size={16} />} type="default" className="border-[var(--border-strong)] text-[var(--text-secondary)] font-medium">Add Access</Button>
              <Button icon={<Trash2 size={16} />} danger className="font-medium">Remove Access</Button>
              <Input
                prefix={<Search size={16} className="text-[var(--text-tertiary)]" />}
                placeholder="Filter apps..."
                className="w-48 rounded-lg"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                allowClear
              />
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredApps.map(app => (
                  <div key={app.id} className="bg-[var(--surface-base)] rounded-2xl border border-[var(--border-default)] p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] flex items-center justify-center font-bold text-[var(--text-secondary)] text-lg">
                          {app.icon}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-primary)] flex items-center gap-1">
                            <span className="truncate max-w-[120px]" title={app.name}>{app.name}</span>
                            {app.os === 'ios' ? <Apple size={14} className="text-[var(--text-tertiary)]" /> : <Smartphone size={14} className="text-[var(--text-tertiary)]" />}
                          </div>
                          <div className="text-[10px] text-[var(--text-tertiary)] font-mono truncate max-w-[140px]" title={app.package}>{app.package}</div>
                        </div>
                      </div>
                      <Checkbox />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <PermissionBadge network="google" level={app.permissions.google} />
                      <PermissionBadge network="meta" level={app.permissions.meta} />
                      <PermissionBadge network="apple" level={app.permissions.apple} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Phase 4: Empty state for app filter */
              <Card className="rounded-xl" style={{ border: '1px solid var(--border-default)' }}>
                <EmptyState
                  icon={<Smartphone size={32} className="stroke-[1.5]" />}
                  title="No apps match your filter"
                  description={`Không tìm thấy ứng dụng nào khớp với "${appSearch}". Thử tìm kiếm khác.`}
                  actionLabel="Clear filter"
                  onAction={() => setAppSearch('')}
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions;
