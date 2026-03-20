import SectionHeader from "../../components/common/SectionHeader";
import PageContent from "../../components/common/PageContent";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";

export default function FeatureTour() {
	return (
		<div className="w-full bg-[#0d1117] text-[#e6edf3] min-h-screen">
			<PageContent maxWidth="max-w-4xl" className="py-12">
				<SectionHeader
					title="Feature Tour"
					subtitle="A guided walk through the best of CampusConnect is coming soon."
				/>
				<Card className="mt-10" padding="p-10">
					<EmptyState
						icon="tour"
						title="Tour in progress"
						description="We are polishing a multi-step walkthrough of key features."
					/>
				</Card>
			</PageContent>
		</div>
	);
}
