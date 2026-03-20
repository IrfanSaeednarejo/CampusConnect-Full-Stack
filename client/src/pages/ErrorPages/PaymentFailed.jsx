import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import ErrorPageShell from "../../components/error/ErrorPageShell";

export default function PaymentFailed() {
	const navigate = useNavigate();

	const handleRetry = () => {
		window.location.reload();
	};

	return (
		<ErrorPageShell
			icon="credit_card_off"
			iconClassName="text-[#f85149]"
			code="402"
			title="Payment Failed"
			message="We couldn't process your payment. Please check your details and try again."
			actions={
				<>
					<Button variant="primary" onClick={handleRetry}>
						Try Again
					</Button>
					<Button variant="secondary" onClick={() => navigate("/contact-us")}>
						Contact Support
					</Button>
				</>
			}
		/>
	);
}
