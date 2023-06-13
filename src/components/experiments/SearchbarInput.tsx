import { GhostButton } from '@/components/brand/GhostButton';
import { SearchIcon } from '@chakra-ui/icons';
import { Icon, InputGroup, InputRightElement } from '@chakra-ui/react';
import {
	TextInput,
	TextInputProps,
	useFormContext,
} from '@splatterxl/chakra-forms';

export function SearchbarInput(props: TextInputProps) {
	const context = useFormContext();

	return (
		<InputGroup>
			<TextInput {...props} />
			<InputRightElement pr={3}>
				<GhostButton
					variant='ghost'
					type='submit'
					isLoading={context.loading}
					label='Search'
					icon={<Icon as={SearchIcon} />}
					iconOnly
					actuallyGhost
					normalColor
				/>
			</InputRightElement>
		</InputGroup>
	);
}
