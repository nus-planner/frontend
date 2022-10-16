import {
    Box,
    BoxProps,
    Button,
    Heading,
    SimpleGrid,
    Stack,
    Text,
    useBreakpointValue,
    useColorModeValue,
  } from '@chakra-ui/react'
  import * as React from 'react'
  import { FiDownloadCloud } from 'react-icons/fi'
  
  export const Content = () => (
    <Stack spacing={{ base: '8', lg: '6' }}>
      <Stack spacing="4" direction={{ base: 'column', lg: 'row' }} justify="space-between">
        <Stack spacing="1">
          <Heading fontWeight="medium">
            NUS Planner
          </Heading>
          <Text color="muted"> Make your study plan and check for your graduation requirements </Text>
        </Stack>
        <Stack direction="row" spacing="3">
          <Button variant="secondary" leftIcon={<FiDownloadCloud />}>
            Download
          </Button>
        </Stack>
      </Stack>
      <Stack spacing={{ base: '5', lg: '6' }}>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
          <Card />
          <Card />
          <Card />
        </SimpleGrid>
      </Stack>
      <Card minH="xs" />
    </Stack>
  )
  
  const Card = (props: BoxProps) => (
    <Box
      minH="36"
      bg="bg-surface"
      boxShadow={useColorModeValue('sm', 'sm-dark')}
      borderRadius="lg"
      {...props}
    />
  )

export default Content;
