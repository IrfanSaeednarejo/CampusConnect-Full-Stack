export default function Switch({ checked, onChange, className = "" }) {
	return (
		<label className={`relative inline-flex items-center cursor-pointer ${className}`}>
			<input
				type="checkbox"
				checked={checked}
				onChange={onChange}
				className="sr-only peer"
			/>
			<div
				className={`w-9 h-5 rounded-full transition-colors ${
					checked ? "bg-primary" : "bg-[#C7D2FE]"
				}`}
			></div>
			<div
				className={`absolute w-4 h-4 rounded-full bg-[#0F172A] transition-transform ${
					checked ? "translate-x-4" : "translate-x-0.5"
				}`}
			></div>
		</label>
	);
}
