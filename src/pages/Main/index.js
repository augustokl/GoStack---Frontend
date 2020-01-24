import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import { Form, SubmitButton, List } from './styles';
import Container from '../../components/Container/index';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    fail: false,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    const { newRepo, repositories } = this.state;

    let data;
    let fail = false;

    const exists = repositories.find(value => value.name === newRepo);

    try {
      if (exists) {
        throw new Error('Repositório duplicado');
      }

      const response = await api.get(`/repos/${newRepo}`);

      data = [
        ...repositories,
        {
          name: response.data.full_name,
        },
      ];
    } catch (error) {
      fail = true;
      data = repositories;
    } finally {
      this.setState({
        repositories: data,
        newRepo: '',
        loading: false,
        fail,
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, fail } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>
        <Form onSubmit={this.handleSubmit} fail={fail}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>
        <List>
          {repositories.map(
            repository =>
              repository.name && (
                <li key={repository.name}>
                  <span>{repository.name}</span>
                  <Link
                    to={`/repository/${encodeURIComponent(repository.name)}`}
                  >
                    Detalhes
                  </Link>
                </li>
              )
          )}
        </List>
      </Container>
    );
  }
}
