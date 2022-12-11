import { Progress } from '@chakra-ui/react';
import Router from 'next/router';
import { createContext, useContext, useState } from 'react';

const NavigationProgressBarProvider = createContext({
	setVisible: (value: boolean) => {},
	visible: false
});

export const NavigationProgressBar = () => {
	const [visible, setVisible] = useState(false);

	Router.events.on('routeChangeComplete', () => {
		setVisible(false);
	});
	Router.events.on('routeChangeStart', () => {
		setVisible(true);
	});

	// if (visible) alert('balls');

	return (
		<NavigationProgressBarProvider.Provider
			value={{
				setVisible,
				visible
			}}
		>
			<Progress
				height='1px'
				w='100vw'
				pos='fixed'
				top={0}
				left={0}
				zIndex={999999}
				isIndeterminate={visible}
				display={visible ? 'block' : 'none'}
				aria-hidden='true'
				colorScheme='orange'
			/>
		</NavigationProgressBarProvider.Provider>
	);
};

export const useNavigationProgressBar = () =>
	useContext(NavigationProgressBarProvider);
