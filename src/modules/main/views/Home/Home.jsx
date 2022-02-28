import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Tabs,
  Tab,
} from "carbon-components-react";
import { Application32, Globe32, PersonFavorite32 } from "@carbon/icons-react";

import { GlobalContext } from "../../../../App.jsx";

import { InfoSection, InfoCard } from "../../../../components/Info";

const zuppliTechWikiLink = "https://chiper.atlassian.net/wiki/spaces/CTW/overview";

const Home = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  useEffect(() => {
    if (!user) {
      return navigate("/");
    }
  }, [navigate, user]);

  return (
    <div className="bx--grid bx--grid--full-width landing-page">
      <div className="bx--row landing-page__banner">
        <div className="bx--col-lg-16">
          <Breadcrumb noTrailingSlash aria-label="Page navigation">
            <BreadcrumbItem>
              <a href={zuppliTechWikiLink} target="_blank" rel="noreferrer">Getting started</a>
            </BreadcrumbItem>
          </Breadcrumb>
          <h1 className="landing-page__heading">Configure &amp; secure with Authorizer</h1>
        </div>
      </div>

      <div className="bx--row landing-page__r2">
        <div className="bx--col bx--no-gutter">
          <Tabs selected={0} role="navigation" aria-label="Tab navigation">
            <Tab label="About">
              <div className="bx--grid bx--grid--no-gutter bx--grid--full-width">
                <div className="bx--row landing-page__tab-content">
                  <div className="bx--col-md-4 bx--col-lg-7">
                    <h2 className="landing-page__subheading">
                      What is Authorizer?
                    </h2>
                    <p className="landing-page__p">
                      Authorizer is a project that allows you to secure your
                      API resources through a simple configutarion process.
                      Our API works our product works hand in hand with the
                      Ambassador API gateway.
                    </p>
                    <div style={{ marginTop: "1rem" }}>
                      <Button href={zuppliTechWikiLink} target="_blank">Learn more</Button>
                    </div>
                  </div>
                  <div className="bx--col-md-4 bx--offset-lg-1 bx--col-lg-8">
                    <img
                      className="landing-page__illo"
                      src={`${process.env.PUBLIC_URL}/tab-illo.png`}
                      alt="Carbon illustration"
                    />
                  </div>
                </div>
              </div>
            </Tab>
            <Tab label="Configure">
              <div className="bx--grid bx--grid--no-gutter bx--grid--full-width">
                <div className="bx--row landing-page__tab-content">
                  <div className="bx--col-lg-16">
                    Rapidly configure your routes and permissions. The Authorizer web
                    provides to you a simple interface to do this.
                  </div>
                </div>
              </div>
            </Tab>
            <Tab label="Secure">
              <div className="bx--grid bx--grid--no-gutter bx--grid--full-width">
                <div className="bx--row landing-page__tab-content">
                  <div className="bx--col-lg-16">
                    Once you have configured in an easy and intuitive way, you can
                    be sure Authorizer will try to secure your API resources by working
                    together with the Ambassador API gateway.
                  </div>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>

      <InfoSection heading="The Principles" className="landing-page__r3">
        <InfoCard
          heading="Authorizer is Simple"
          body="This isn't rocket science, this project has been made (and we still) with simplicity in mind, it's just composed by a set of tables related in a simple way."
          icon={<PersonFavorite32 />}
        />
        <InfoCard
          heading="Authorizer is Modular"
          body="Authorizer's modularity ensures flexibility in execution, this allows to increase the adaptability in order to be sync with the business needs."
          icon={<Application32 />}
        />
        <InfoCard
          heading="Authorizer is Efficient"
          body="As our main effort, we focus on the performance to be efficient, so day by day we gonna work to keep improving the response times at Authorizer project."
          icon={<Globe32 />}
        />
      </InfoSection>
    </div>
  );
};

export default Home;