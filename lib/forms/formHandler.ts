// lib/formHandlers.ts

type SetConnectionStatusType = React.Dispatch<React.SetStateAction<'idle' | 'connecting' | 'success' | 'error'>>;
type SetErrorMessageType = React.Dispatch<React.SetStateAction<string>>;

export const handleFormSubmit = async (
	values: Record<string, any>,
	setConnectionStatus: SetConnectionStatusType,
	setErrorMessage: SetErrorMessageType
) => {
	setConnectionStatus('connecting');
	setErrorMessage('');

	try {
		const res = await fetch('/api/database/test', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(values),
		});

		const data = await res.json();
		setConnectionStatus(data.status);
		if (data.status === 'error') {
			setErrorMessage(data.message);
		}
	} catch (error) {
		setConnectionStatus('error');
		setErrorMessage(error instanceof Error ? error.message : 'Connection failed');
	}
};
