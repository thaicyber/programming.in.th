import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Flex, Button, Select, Text, useToast } from '@chakra-ui/core'

import { useUser } from '../../UserContext'

import { UploadCode } from '../../Upload'
import { useSubmit } from './useSubmit'
import { languageData } from '.'

export const Normal = ({ metadata }) => {
  const toast = useToast()
  const { user } = useUser()
  const router = useRouter()

  const {
    submit,
    codeFile,
    setCodeFile,
    onDrop,
    setLanguage,
    status,
    submissionID
  } = useSubmit(metadata)

  useEffect(() => {
    if (status === 'OK') {
      router.push(`/submissions/${submissionID}`)
    } else if (status === 'ERROR') {
      toast({
        title: 'Error!',
        description: 'An unknown error occured.',
        status: 'error',
        duration: 9000,
        isClosable: true
      })
    }
  }, [status, submissionID])

  return (
    <Flex direction="column" px={4}>
      <Flex align="baseline">
        <UploadCode
          index={0}
          codeFile={codeFile}
          setCodeFile={setCodeFile}
          onDrop={onDrop(0)}
          multiple={false}
        />
        {codeFile[0] ? (
          <Text ml={4} fontSize="sm">
            {codeFile[0]?.name}
          </Text>
        ) : (
          <Text ml={4} fontSize="sm">
            No file chosen
          </Text>
        )}
      </Flex>
      <Flex>
        <Select
          mt={8}
          width="120px"
          size="sm"
          defaultValue={languageData[0][0]}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
            setLanguage(event.target.value)
          }
        >
          {languageData.map((data: string[]) => (
            <option key={data[0]} value={data[0]}>
              {data[1]}
            </option>
          ))}
        </Select>

        <Button
          isLoading={status === 'LOADING'}
          ml={8}
          size="sm"
          mt={8}
          width="200px"
          onClick={submit}
          isDisabled={user === null}
        >
          Submit
        </Button>
      </Flex>
    </Flex>
  )
}
