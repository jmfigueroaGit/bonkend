// lib/formHandlers.ts

import { connectToDatabase } from '../database';

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
		const connected = await connectToDatabase(values);

		if (connected) {
			setConnectionStatus('success');
		} else {
			setConnectionStatus('error');
			setErrorMessage('Invalid credentials or unsupported database type');
		}
	} catch (error) {
		setConnectionStatus('error');
		setErrorMessage(error instanceof Error ? error.message : 'Connection failed');
	}
};
