import { SearchbarInput } from '@/components/experiments/SearchbarInput';
import { Routes } from '@/utils/constants';
import { Form, FormContext, FormField } from '@splatterxl/chakra-forms';

import { useRouter } from 'next/router';
import { useRef } from 'react';

export function SearchForm() {
	const router = useRouter();

	const ref = useRef<FormContext>(null);

	return (
		<Form
			id='search'
			customButtons
			onSubmit={function ({ input }) {
				router.push(Routes.SEARCH_RESULTS(input), undefined, {
					shallow: false,
				});
			}}
			maxW='lg'
			px={4}
			initialFocus='input'
			// TODO: form context ref
			// ref={ref}
		>
			<FormField
				id='input'
				as={SearchbarInput}
				placeholder='Search for an experiment'
				inputProps={{
					tabIndex: 1,
				}}
			/>
		</Form>
	);
}
