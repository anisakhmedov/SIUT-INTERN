import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Edit3, Save, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { get, patch, post } from '../utils/apiClient';
import { toast } from '../utils/toast';
import { CustomSelect } from './ui';

const ROLE_OPTIONS = ['Tutor', 'Admin', 'Rector', 'Professor', 'Student'];
const BASE_EDIT_FIELDS = ['name', 'surname', 'login', 'password', 'role'];
const CONTACT_FIELD_OPTIONS = [
  { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
  { key: 'phone', label: 'Phone', type: 'text', placeholder: '+994501112233' },
  { key: 'telegram', label: 'Telegram', type: 'text', placeholder: '@johndoe' },
  { key: 'whatsapp', label: 'WhatsApp', type: 'text', placeholder: '+994501112233' },
];

function emptyContactValues() {
  return CONTACT_FIELD_OPTIONS.reduce((acc, field) => {
    acc[field.key] = '';
    return acc;
  }, {});
}

function emptyContactEnabled() {
  return CONTACT_FIELD_OPTIONS.reduce((acc, field) => {
    acc[field.key] = false;
    return acc;
  }, {});
}

function extractContactState(contact) {
  const values = emptyContactValues();
  const enabled = emptyContactEnabled();

  CONTACT_FIELD_OPTIONS.forEach(({ key }) => {
    const value = typeof contact?.[key] === 'string' ? contact[key].trim() : '';
    values[key] = value;
    enabled[key] = Boolean(value);
  });

  return { values, enabled };
}

function buildContactPayload(values, enabled) {
  const payload = {};
  CONTACT_FIELD_OPTIONS.forEach(({ key }) => {
    if (!enabled?.[key]) return;
    const value = (values?.[key] || '').trim();
    if (value) payload[key] = value;
  });
  return payload;
}

function extractUsers(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
}

function extractSingleUser(payload) {
  if (payload?._id || payload?.id) return payload;
  if (payload?.user && (payload.user._id || payload.user.id)) return payload.user;
  if (payload?.data && !Array.isArray(payload.data) && (payload.data._id || payload.data.id)) return payload.data;

  const users = extractUsers(payload);
  if (users.length === 1) return users[0];
  return null;
}

function getUserId(user, index) {
  return user?._id || user?.id || `user-${index}`;
}

function buildEditableData(user) {
  return {
    name: String(user?.name || ''),
    surname: String(user?.surname || ''),
    login: String(user?.login || ''),
    password: '',
    role: String(user?.role || 'Tutor'),
  };
}

export default function CreateTutorPage() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    login: '',
    password: '',
    role: 'Tutor',
  });
  const [createContactEnabled, setCreateContactEnabled] = useState(emptyContactEnabled());
  const [createContactValues, setCreateContactValues] = useState(emptyContactValues());
  const [submitting, setSubmitting] = useState(false);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editFormData, setEditFormData] = useState({});
  const [editContactEnabled, setEditContactEnabled] = useState(emptyContactEnabled());
  const [editContactValues, setEditContactValues] = useState(emptyContactValues());
  const [savingEdit, setSavingEdit] = useState(false);
  const selectedUserIdRef = useRef('');

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const payload = await get('/usersInternship');
      const nextUsers = extractUsers(payload);
      setUsers(nextUsers);

      if (!nextUsers.length) {
        setSelectedUserId('');
        setEditFormData({});
        setEditContactEnabled(emptyContactEnabled());
        setEditContactValues(emptyContactValues());
        return;
      }

      const currentSelectedId = selectedUserIdRef.current;
      if (!currentSelectedId) {
        const firstId = getUserId(nextUsers[0], 0);
        setSelectedUserId(firstId);
        setEditFormData(buildEditableData(nextUsers[0]));
        const firstContact = extractContactState(nextUsers[0]?.contact);
        setEditContactEnabled(firstContact.enabled);
        setEditContactValues(firstContact.values);
      } else {
        const selected = nextUsers.find((user, index) => getUserId(user, index) === currentSelectedId);
        if (selected) {
          setEditFormData(buildEditableData(selected));
          const selectedContact = extractContactState(selected?.contact);
          setEditContactEnabled(selectedContact.enabled);
          setEditContactValues(selectedContact.values);
        } else {
          const firstId = getUserId(nextUsers[0], 0);
          setSelectedUserId(firstId);
          setEditFormData(buildEditableData(nextUsers[0]));
          const firstContact = extractContactState(nextUsers[0]?.contact);
          setEditContactEnabled(firstContact.enabled);
          setEditContactValues(firstContact.values);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load users.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const selectedUser = useMemo(
    () => users.find((user, index) => getUserId(user, index) === selectedUserId) || null,
    [selectedUserId, users],
  );

  const roleOptions = useMemo(() => {
    const dynamicRoles = Array.from(new Set(users.map((user) => user?.role).filter(Boolean)));
    return Array.from(new Set([...ROLE_OPTIONS, ...dynamicRoles]));
  }, [users]);

  const handleCreateChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCreateContactToggle = useCallback((key, enabled) => {
    setCreateContactEnabled((prev) => ({ ...prev, [key]: enabled }));
    if (!enabled) {
      setCreateContactValues((prev) => ({ ...prev, [key]: '' }));
    }
  }, []);

  const handleCreateContactChange = useCallback((key, value) => {
    setCreateContactValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const contactPayload = buildContactPayload(createContactValues, createContactEnabled);
      const payload = {
        ...formData,
        ...(Object.keys(contactPayload).length ? { contact: contactPayload } : {}),
      };

      const createdPayload = await post('/usersInternship/register', payload);
      toast.success('User was created successfully.');

      const createdUser = extractSingleUser(createdPayload);
      if (createdUser) {
        setUsers((current) => [createdUser, ...current]);
      }

      setFormData({
        name: '',
        surname: '',
        login: '',
        password: '',
        role: 'Tutor',
      });
      setCreateContactEnabled(emptyContactEnabled());
      setCreateContactValues(emptyContactValues());

      if (!createdUser) {
        await fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectUser = useCallback((user, index) => {
    const id = getUserId(user, index);
    setSelectedUserId(id);
    setEditFormData(buildEditableData(user));
    const selectedContact = extractContactState(user?.contact);
    setEditContactEnabled(selectedContact.enabled);
    setEditContactValues(selectedContact.values);
  }, []);

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleEditContactToggle = useCallback((key, enabled) => {
    setEditContactEnabled((prev) => ({ ...prev, [key]: enabled }));
    if (!enabled) {
      setEditContactValues((prev) => ({ ...prev, [key]: '' }));
    }
  }, []);

  const handleEditContactChange = useCallback((key, value) => {
    setEditContactValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const renderedUsers = useMemo(() => {
    if (loadingUsers) return <div className="ctp-empty">Loading users...</div>;
    if (users.length === 0) return <div className="ctp-empty">No users found.</div>;

    return users.map((user, index) => {
      const id = getUserId(user, index);
      const isActive = id === selectedUserId;
      return (
        <button
          key={id}
          type="button"
          className={`ctp-user-item ${isActive ? 'active' : ''}`}
          onClick={() => selectUser(user, index)}
        >
          <p className="ctp-user-name">{user?.name || 'Unknown'} {user?.surname || ''}</p>
          <div className="ctp-user-meta">
            <span>Login: {user?.login || 'N/A'}</span>
            <span>Role: {user?.role || 'N/A'}</span>
          </div>
        </button>
      );
    });
  }, [loadingUsers, users, selectedUserId, selectUser]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const userId = selectedUser._id || selectedUser.id;
    if (!userId) {
      toast.error('Selected user does not have an id.');
      return;
    }

    setSavingEdit(true);

    const payload = { ...editFormData };
    if (!payload.password) {
      delete payload.password;
    }

    const contactPayload = buildContactPayload(editContactValues, editContactEnabled);
    payload.contact = contactPayload;

    try {
      const updatedPayload = await patch(`/usersInternship/${userId}`, payload);
      const updatedUser = extractSingleUser(updatedPayload) || { ...selectedUser, ...payload };

      setUsers((current) => current.map((user, index) => {
        const currentId = getUserId(user, index);
        return String(currentId) === String(userId) ? { ...user, ...updatedUser } : user;
      }));

      setEditFormData(buildEditableData({ ...selectedUser, ...updatedUser }));
      const updatedContact = extractContactState(updatedUser?.contact || contactPayload);
      setEditContactEnabled(updatedContact.enabled);
      setEditContactValues(updatedContact.values);
      toast.success('User was updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update user.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="ctp-page">
      <style>{`
        .ctp-page {
          min-height: calc(100vh - 64px);
          padding: clamp(16px, 3vw, 44px);
          background:
            radial-gradient(1000px 500px at 5% 0%, rgba(8, 145, 178, .12), transparent 60%),
            radial-gradient(850px 450px at 100% 10%, rgba(22, 163, 74, .10), transparent 60%),
            linear-gradient(180deg, rgba(240, 249, 255, .86), rgba(255, 255, 255, 1));
        }
        .ctp-shell {
          max-width: 1320px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(clamp(280px,30vw,420px), 420px) minmax(0, 1fr);
          gap: clamp(12px,2vw,18px);
        }
        @media(max-width:1024px){
          .ctp-shell {
            grid-template-columns: 1fr;
          }
        }
        .ctp-card {
          background: rgba(255, 255, 255, .95);
          border: 1px solid rgba(0, 0, 0, .08);
          border-radius: clamp(16px,2vw,20px);
          padding: clamp(16px, 2.2vw, 28px);
          box-shadow: 0 18px 50px rgba(14, 116, 144, .12);
          backdrop-filter: blur(12px);
        }
        .ctp-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(8px,2vw,12px);
          margin-bottom: clamp(12px,2vw,16px);
        }
        .ctp-title {
          margin: 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: clamp(18px, 3.5vw, 28px);
          color: #0f172a;
          letter-spacing: -.01em;
        }
        .ctp-sub {
          margin: clamp(4px,1vw,8px) 0 0;
          font-size: clamp(12px,1.8vw,13px);
          color: #475569;
          line-height: 1.55;
        }
        .ctp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: clamp(6px,1vw,8px) clamp(8px,2vw,12px);
          border-radius: 999px;
          background: rgba(8, 145, 178, .10);
          border: 1px solid rgba(8, 145, 178, .20);
          color: #0e7490;
          font-size: clamp(11px,1.8vw,12px);
          font-weight: 700;
          white-space: nowrap;
        }
        .ctp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(clamp(120px,40vw,1fr), 1fr));
          gap: clamp(10px,1.5vw,12px);
        }
        @media(max-width:640px){
          .ctp-grid {
            grid-template-columns: 1fr;
          }
        }
        .ctp-field {
          display: flex;
          flex-direction: column;
          gap: clamp(4px,1vw,6px);
        }
        .ctp-field--full {
          grid-column: 1 / -1;
        }
        .ctp-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: .05em;
          text-transform: uppercase;
        }
        .ctp-input {
          width: 100%;
          border-radius: 12px;
          border: 1.5px solid rgba(15, 23, 42, .12);
          background: rgba(255, 255, 255, .90);
          padding: 11px 13px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
        }
        .ctp-input:focus {
          border-color: rgba(8, 145, 178, .55);
          box-shadow: 0 0 0 4px rgba(8, 145, 178, .12);
          background: #fff;
        }
        .ctp-actions {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
        }
        .ctp-contact-block {
          margin-top: 12px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(8, 145, 178, .16);
          background: rgba(8, 145, 178, .04);
          grid-column: 1 / -1;
        }
        .ctp-contact-title {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #0e7490;
          font-weight: 800;
          letter-spacing: .05em;
          text-transform: uppercase;
        }
        .ctp-contact-sub {
          margin: 0 0 10px 0;
          font-size: 12px;
          color: #64748b;
        }
        .ctp-contact-row {
          display: grid;
          grid-template-columns: minmax(130px, 170px) minmax(0, 1fr);
          gap: 10px;
          align-items: center;
          margin-bottom: 8px;
        }
        .ctp-contact-row:last-child {
          margin-bottom: 0;
        }
        .ctp-check {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #0f172a;
          font-weight: 600;
        }
        .ctp-check input {
          width: 16px;
          height: 16px;
          accent-color: #0891b2;
        }
        .ctp-btn {
          border: 1px solid rgba(8, 145, 178, .20);
          background: linear-gradient(135deg, #0891b2, #16a34a);
          color: #fff;
          border-radius: 12px;
          padding: 11px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .ctp-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(8, 145, 178, .25);
        }
        .ctp-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }
        .ctp-alert {
          margin-bottom: 12px;
          border-radius: 12px;
          padding: 11px 13px;
          font-size: 13px;
          border: 1px solid;
        }
        .ctp-alert--error {
          color: #991b1b;
          border-color: rgba(220, 38, 38, .24);
          background: rgba(220, 38, 38, .08);
        }
        .ctp-alert--ok {
          color: #166534;
          border-color: rgba(22, 163, 74, .24);
          background: rgba(22, 163, 74, .08);
        }
        .ctp-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }
        .ctp-count {
          font-size: 12px;
          color: #0e7490;
          background: rgba(8, 145, 178, .10);
          border: 1px solid rgba(8, 145, 178, .2);
          border-radius: 999px;
          padding: 6px 9px;
          font-weight: 700;
        }
        .ctp-layout {
          display: grid;
          grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
          gap: 14px;
        }
        .ctp-user-list {
          border: 1px solid rgba(0, 0, 0, .08);
          border-radius: 16px;
          background: rgba(248, 250, 252, .95);
          max-height: 72vh;
          overflow: auto;
          padding: 8px;
        }
        .ctp-user-item {
          width: 100%;
          text-align: left;
          border: 1px solid transparent;
          border-radius: 12px;
          background: transparent;
          padding: 10px;
          cursor: pointer;
          margin-bottom: 6px;
          transition: all .18s ease;
        }
        .ctp-user-item:hover {
          background: rgba(8, 145, 178, .06);
          border-color: rgba(8, 145, 178, .2);
        }
        .ctp-user-item.active {
          background: linear-gradient(135deg, rgba(8, 145, 178, .12), rgba(22, 163, 74, .08));
          border-color: rgba(8, 145, 178, .28);
        }
        .ctp-user-name {
          font-size: 14px;
          color: #0f172a;
          font-weight: 700;
          margin: 0;
        }
        .ctp-user-meta {
          margin-top: 3px;
          font-size: 12px;
          color: #64748b;
          display: grid;
          gap: 2px;
        }
        .ctp-empty {
          padding: 18px;
          color: #64748b;
          font-size: 13px;
          text-align: center;
        }
        @media (max-width: 980px) {
          .ctp-shell,
          .ctp-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 720px) {
          .ctp-grid {
            grid-template-columns: 1fr;
          }
          .ctp-contact-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="ctp-shell">
        <div className="ctp-card">
          <div className="ctp-head">
            <div>
              <h1 className="ctp-title">Create Staff Account</h1>
              <p className="ctp-sub">
                Add a new system user for internship workflows.
              </p>
            </div>
            <span className="ctp-badge">
              <ShieldCheck size={14} /> Admin only
            </span>
          </div>
          <form onSubmit={handleCreateSubmit}>
            <div className="ctp-grid">
              <label className="ctp-field">
                <span className="ctp-label">Name</span>
                <input className="ctp-input" name="name" value={formData.name} onChange={handleCreateChange} required />
              </label>

              <label className="ctp-field">
                <span className="ctp-label">Surname</span>
                <input className="ctp-input" name="surname" value={formData.surname} onChange={handleCreateChange} required />
              </label>

              <label className="ctp-field">
                <span className="ctp-label">Login</span>
                <input className="ctp-input" name="login" value={formData.login} onChange={handleCreateChange} required />
              </label>

              <label className="ctp-field">
                <span className="ctp-label">Password</span>
                <input className="ctp-input" type="password" name="password" value={formData.password} onChange={handleCreateChange} required />
              </label>

              <label className="ctp-field ctp-field--full">
                <span className="ctp-label">Role</span>
                <CustomSelect
                  value={formData.role}
                  onChange={(v) => handleCreateChange({ target: { name: 'role', value: v } })}
                  options={roleOptions.map((r) => ({ value: r, label: r }))}
                  placeholder="Select role"
                />
              </label>

              <div className="ctp-contact-block">
                <p className="ctp-contact-title">Optional contact</p>
                <p className="ctp-contact-sub">Enable only contact fields you need for this user.</p>
                {CONTACT_FIELD_OPTIONS.map((field) => (
                  <div className="ctp-contact-row" key={`create-${field.key}`}>
                    <label className="ctp-check" htmlFor={`create-contact-${field.key}`}>
                      <input
                        id={`create-contact-${field.key}`}
                        type="checkbox"
                        checked={createContactEnabled[field.key]}
                        onChange={(e) => handleCreateContactToggle(field.key, e.target.checked)}
                      />
                      <span>{field.label}</span>
                    </label>
                    {createContactEnabled[field.key] && (
                      <input
                        className="ctp-input"
                        type={field.type}
                        value={createContactValues[field.key]}
                        onChange={(e) => handleCreateContactChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="ctp-actions">
              <button className="ctp-btn" type="submit" disabled={submitting}>
                <UserPlus size={15} /> {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>

        <div className="ctp-card">
          <div className="ctp-panel-head">
            <h2 className="ctp-title" style={{ fontSize: 22, margin: 0 }}>All Users</h2>
            <span className="ctp-count"><Users size={13} style={{ marginRight: 6 }} /> {users.length}</span>
          </div>
          <div className="ctp-layout">
            <div className="ctp-user-list">
              {renderedUsers}
            </div>

            <div>
              <div className="ctp-head" style={{ marginBottom: 10 }}>
                <div>
                  <h3 className="ctp-title" style={{ fontSize: 20, margin: 0 }}>Edit User</h3>
                  <p className="ctp-sub" style={{ marginTop: 5 }}>
                    Update any field for the selected user and save changes.
                  </p>
                </div>
                <span className="ctp-badge"><Edit3 size={13} /> Full edit</span>
              </div>
              {selectedUser ? (
                <form onSubmit={handleEditSubmit}>
                  <div className="ctp-grid">
                    {BASE_EDIT_FIELDS.map((field) => {
                      const isRoleField = field.toLowerCase() === 'role';
                      const isPasswordField = field.toLowerCase() === 'password';
                      return (
                        <label key={field} className={`ctp-field ${field.length > 12 ? 'ctp-field--full' : ''}`}>
                          <span className="ctp-label">{field}</span>
                          {isRoleField ? (
                            <CustomSelect
                              value={editFormData[field] ?? ''}
                              onChange={(v) => handleEditChange({ target: { name: field, value: v } })}
                              options={roleOptions.map((r) => ({ value: r, label: r }))}
                              placeholder="Select role"
                            />
                          ) : (
                            <input
                              className="ctp-input"
                              type={isPasswordField ? 'password' : 'text'}
                              name={field}
                              value={editFormData[field] ?? ''}
                              onChange={handleEditChange}
                              placeholder={isPasswordField ? 'Leave blank to keep current password' : ''}
                            />
                          )}
                        </label>
                      );
                    })}

                    <div className="ctp-contact-block">
                      <p className="ctp-contact-title">Optional contact</p>
                      <p className="ctp-contact-sub">Select what contact information should be stored for this user.</p>
                      {CONTACT_FIELD_OPTIONS.map((field) => (
                        <div className="ctp-contact-row" key={`edit-${field.key}`}>
                          <label className="ctp-check" htmlFor={`edit-contact-${field.key}`}>
                            <input
                              id={`edit-contact-${field.key}`}
                              type="checkbox"
                              checked={editContactEnabled[field.key]}
                              onChange={(e) => handleEditContactToggle(field.key, e.target.checked)}
                            />
                            <span>{field.label}</span>
                          </label>
                          {editContactEnabled[field.key] && (
                            <input
                              className="ctp-input"
                              type={field.type}
                              value={editContactValues[field.key]}
                              onChange={(e) => handleEditContactChange(field.key, e.target.value)}
                              placeholder={field.placeholder}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ctp-actions">
                    <button className="ctp-btn" type="submit" disabled={savingEdit}>
                      <Save size={15} /> {savingEdit ? 'Saving...' : 'Save User Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="ctp-empty" style={{ textAlign: 'left', padding: '12px 0' }}>
                  Select a user from the left list to edit all fields.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
