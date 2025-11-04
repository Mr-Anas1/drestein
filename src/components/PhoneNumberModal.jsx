'use client';

import { useState } from 'react';
import { X, Phone as PhoneIcon, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';

export default function PhoneNumberModal({ onComplete }) {
	const [phone, setPhone] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const submit = async (e) => {
		e.preventDefault();
		setError('');
		if (!phone.trim()) {
			setError('Phone number is required');
			return;
		}
		try {
			setLoading(true);
			const user = auth.currentUser;
			if (!user) {
				setError('Not authenticated');
				return;
			}
			const idToken = await user.getIdToken();
			const res = await fetch('/api/students/update-phone', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${idToken}`,
				},
				body: JSON.stringify({ phone: phone.trim() }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Failed to update phone');
			onComplete?.();
		} catch (err) {
			setError(err.message || 'Failed to update phone');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onComplete?.()}>
			<div className="bg-background border border-border rounded-xl p-6 w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h3 className="font-audiowide text-white text-lg">Add Phone Number</h3>
					{/* <button onClick={() => onComplete?.()} className="text-muted-text hover:text-white">
						<X size={20} />
					</button> */}
				</div>
				<p className="text-muted-text font-space text-sm mb-4">Please add your phone number to complete your profile.</p>
				{error && (
					<div className="bg-red-900/30 border border-red-700 text-red-200 px-3 py-2 rounded mb-3 text-sm">{error}</div>
				)}
				<form onSubmit={submit} className="space-y-3">
					<div>
						<label className="block text-white font-audiowide text-xs mb-1">Phone Number</label>
						<div className="flex items-center gap-2 bg-background-soft border border-border rounded px-3 py-2">
							<PhoneIcon size={16} className="text-muted-text" />
							<input
								type="tel"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className="flex-1 bg-transparent text-white outline-none text-sm"
								placeholder="e.g., 9876543210"
							/>
						</div>
					</div>
					<button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-secondary text-white font-audiowide py-2 rounded hover:from-hover-primary hover:to-primary disabled:opacity-50">
						{loading ? (
							<span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
						) : (
							'Save'
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
