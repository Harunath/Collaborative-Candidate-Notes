"use client";

import React from "react";

export default function Loader({ label = "Loading..." }: { label?: string }) {
	return (
		<div className="flex min-h-[40vh] items-center justify-center">
			<div className="flex items-center gap-3">
				<span
					className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent"
					aria-hidden
				/>
				<span className="text-sm text-zinc-600">{label}</span>
			</div>
		</div>
	);
}
