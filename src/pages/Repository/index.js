import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaForward, FaBackward } from 'react-icons/fa';
import api from '../../services/api';

import { Loading, Owner, IssueList, Footer } from './styles';
import Container from '../../components/Container/index';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    state: 'all',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const { state } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleStatus = e => {
    const state = e.target.value.toLowerCase();

    this.setState({ state });

    this.handleIssueUpdate();
  };

  handlePage = page => {
    this.setState({ page });

    this.handleIssueUpdate();
  };

  handleIssueUpdate = async () => {
    const { repository, state, page } = this.state;
    const issues = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state,
        per_page: 5,
        page,
      },
    });

    this.setState({ issues: issues.data });
  };

  render() {
    const { repository, issues, loading, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">
            <FaArrowLeft /> Voltas aos repositórios
          </Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <select onChange={this.handleStatus}>
            <option>All</option>
            <option>Open</option>
            <option>Close</option>
          </select>

          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Footer>
          {page === 1 ? (
            <button type="submit" disabled>
              <FaBackward color="white" />
            </button>
          ) : (
            <button type="submit" onClick={() => this.handlePage(page - 1)}>
              <FaBackward color="white" name="down" />
            </button>
          )}

          <button type="submit" onClick={() => this.handlePage(page + 1)}>
            <FaForward color="white" />
          </button>
        </Footer>
      </Container>
    );
  }
}
