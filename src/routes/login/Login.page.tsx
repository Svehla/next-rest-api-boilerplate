import { Alert, Skeleton } from '@material-ui/lab'
import { Button, Container, Grid, TextField } from '@material-ui/core'
import { LoginContext, LoginContextProvider } from './Login.context'
import { translate } from '../../translations/translate'
import { useContext } from 'react'
import { withCtxProviders } from '../../utils/withCtxProviders'

export const _Login = () => {
  const data = useContext(LoginContext)

  return (
    <Container>
      <h1>{translate('login.header.h1')}</h1>
      <h2>{translate('login.header.h2')}</h2>

      {data.error && <Alert severity='error'>{data.error}</Alert>}

      <Grid container>
        <form onSubmit={data.onSubmit}>
          <div>
            <label>{translate('login.input.username.label')}</label>

            <TextField
              value={data.form.values.username}
              onChange={e => data.form.setVal.username(e.target.value)}
              helperText={data.form.errors.username}
              error={!!data.form.errors.password}
            />
          </div>
          <div>
            <label>{translate('login.input.username.label')}</label>

            <TextField
              value={data.form.values.password}
              onChange={e => data.form.setVal.password(e.target.value)}
              helperText={data.form.errors.password}
              error={!!data.form.errors.password}
              type='password'
            />
          </div>

          <div>{data.loading && <Skeleton />}</div>
          <div>{data.chunkNorrisJoke?.value}</div>

          <Button type='submit'>Submit</Button>
        </form>
      </Grid>
    </Container>
  )
}

export const Login = withCtxProviders([LoginContextProvider])(_Login)
