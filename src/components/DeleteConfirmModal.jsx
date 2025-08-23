'use client';

export default function DeleteConfirmModal({ event, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full">
                <h3 className="font-audiowide text-xl text-white mb-4">Confirm Delete</h3>
                <p className="text-muted-text font-space mb-6">
                    Are you sure you want to delete "{event?.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-audiowide hover:bg-red-700 transition-colors duration-300"
                    >
                        Delete
                    </button>
                    <button
                        onClick={onCancel}
                        className="bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-audiowide hover:bg-background transition-colors duration-300"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
