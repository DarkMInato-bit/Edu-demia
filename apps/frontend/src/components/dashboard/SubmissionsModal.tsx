'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Submission {
  id: string;
  student: { full_name: string, email: string };
  file_name: string;
  file_url: string;
  submitted_at: string;
  is_late: boolean;
}

interface SubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  assignmentTitle: string;
  token: string;
}

export const SubmissionsModal: React.FC<SubmissionsModalProps> = ({ isOpen, onClose, assignmentId, assignmentTitle, token }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && assignmentId) {
      fetchSubmissions();
    }
  }, [isOpen, assignmentId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/assignment/${assignmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setSubmissions(await response.json());
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/download/${encodeURIComponent(fileUrl)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const { url } = await response.json();
        // Open the signed URL in a new tab to trigger download
        window.open(url, '_blank');
      }
    } catch (err) {
      alert('Failed to get download link');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <Card style={{ width: '100%', maxWidth: '800px', margin: '1rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Submissions</h2>
            <p style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>{assignmentTitle}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
          {loading ? (
            <div className="spinner" style={{ margin: '3rem auto' }}></div>
          ) : submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              No submissions yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Student</th>
                  <th style={{ padding: '1rem' }}>File Name</th>
                  <th style={{ padding: '1rem' }}>Submitted At</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600' }}>{sub.student.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub.student.email}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8' }}>{sub.file_name}</td>
                    <td style={{ padding: '1rem' }}>{new Date(sub.submitted_at).toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                      {sub.is_late ? (
                        <span style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>LATE</span>
                      ) : (
                        <span style={{ color: 'var(--success)', background: 'rgba(34, 197, 94, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>ON TIME</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Button variant="outline" onClick={() => handleDownload(sub.file_url, sub.file_name)}>
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};
