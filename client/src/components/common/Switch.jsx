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
					checked ? "bg-[#238636]" : "bg-[#30363d]"
				}`}
			></div>
			<div
				className={`absolute w-4 h-4 rounded-full bg-[#c9d1d9] transition-transform ${
					checked ? "translate-x-4" : "translate-x-0.5"
				}`}
			></div>
		</label>
	);
}
