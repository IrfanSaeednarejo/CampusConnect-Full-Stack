import React from "react";

export default function DisputesSidebar() {
  return (
    <aside className="flex w-64 flex-col bg-surface-dark p-4 border-r border-border-dark">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            data-alt="CampusConnect logo placeholder"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDGhv7x32fwYsxY9SKzGtkLA4w7OvTrzH-r2Z42AZCQ2jo6_SzfDZKkc6vEmxZ2LGCepbzQNYqhQT50w15OlD4M1e5HMUC83pjbCW3t8SAMTKiqziBaYUqc3s41e1qKlF_VbvkylVsNxBp_QVeo0opWpUo05zoUi_hMV3cy6BoHbzPTVHKVi4nwsZjV2cQGDHemzzGvEUFh7Gdrxuen3_UqBuJQzKnLX6Pv4KguVMYueeHJEkzhyyxtuLkmlnpOtQ9aIUzwT9OrbOo")',
            }}
          ></div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-semibold leading-normal">
              Admin Panel
            </h1>
            <p className="text-text-secondary-dark text-sm font-normal leading-normal">
              CampusConnect
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-2 mt-4">
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-button-secondary-dark transition-colors">
            <span className="material-symbols-outlined text-text-secondary-dark">
              dashboard
            </span>
            <p className="text-white text-sm font-medium leading-normal">
              Dashboard
            </p>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-button-secondary-dark transition-colors">
            <span className="material-symbols-outlined text-text-secondary-dark">
              person
            </span>
            <p className="text-white text-sm font-medium leading-normal">
              Users
            </p>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-button-secondary-dark transition-colors">
            <span className="material-symbols-outlined text-text-secondary-dark">
              groups
            </span>
            <p className="text-white text-sm font-medium leading-normal">
              Societies
            </p>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-button-secondary-dark transition-colors">
            <span className="material-symbols-outlined text-text-secondary-dark">
              event
            </span>
            <p className="text-white text-sm font-medium leading-normal">
              Events
            </p>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/20">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              gavel
            </span>
            <p className="text-primary text-sm font-medium leading-normal">
              Disputes
            </p>
          </button>
        </nav>
      </div>
      <div className="mt-auto flex flex-col gap-1">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-button-secondary-dark transition-colors">
          <span className="material-symbols-outlined text-text-secondary-dark">
            settings
          </span>
          <p className="text-white text-sm font-medium leading-normal">
            Settings
          </p>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-button-secondary-dark transition-colors">
          <span className="material-symbols-outlined text-text-secondary-dark">
            logout
          </span>
          <p className="text-white text-sm font-medium leading-normal">
            Logout
          </p>
        </button>
      </div>
    </aside>
  );
}
