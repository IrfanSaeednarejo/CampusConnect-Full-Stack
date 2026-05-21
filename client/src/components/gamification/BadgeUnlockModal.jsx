import Modal from "../common/Modal";

export default function BadgeUnlockModal({ badge, isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Badge Unlocked"
      size="sm"
      footer={null}
    >
      {badge ? (
        <div className="py-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-info/10 text-info">
            <span className="material-symbols-outlined text-4xl">{badge.icon || "military_tech"}</span>
          </div>
          <h3 className="mt-4 text-xl font-bold">{badge.name}</h3>
          <p className="mt-2 text-sm opacity-80">{badge.description}</p>
        </div>
      ) : null}
    </Modal>
  );
}
